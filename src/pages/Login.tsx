import { useState } from "react";
import { useAuth } from "../lib/auth";

type Mode = "signin" | "signup" | "magic";

export default function Login() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim()) {
      setError("enter your email first");
      return;
    }
    if (mode !== "magic" && !password) {
      setError("enter a password");
      return;
    }

    setBusy(true);
    let err: string | null = null;
    if (mode === "signin") err = await signInWithPassword(email, password);
    else if (mode === "signup") err = await signUpWithPassword(email, password);
    else err = await signInWithMagicLink(email);
    setBusy(false);

    if (err) {
      setError(err);
      return;
    }
    if (mode === "magic") setNotice("check your inbox for a sign-in link ♡");
    else if (mode === "signup") setNotice("account made — check your inbox to confirm ♡");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-rose-dark mb-1">hoshii</h1>
          <p className="text-sm text-ink/60">an emotional archive for the things you watch</p>
        </div>

        <div className="bg-white/70 rounded-2xl border border-rose-light/60 p-6">
          <div className="flex gap-1 mb-5 text-sm">
            <TabBtn active={mode === "signin"} onClick={() => setMode("signin")}>sign in</TabBtn>
            <TabBtn active={mode === "signup"} onClick={() => setMode("signup")}>sign up</TabBtn>
            <TabBtn active={mode === "magic"} onClick={() => setMode("magic")}>magic link</TabBtn>
          </div>

          <label className="block text-xs text-ink/60 mb-1">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full mb-4 px-3 py-2 rounded-lg border border-rose-light bg-cream/50 outline-none focus:border-rose"
          />

          {mode !== "magic" && (
            <>
              <label className="block text-xs text-ink/60 mb-1">password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mb-4 px-3 py-2 rounded-lg border border-rose-light bg-cream/50 outline-none focus:border-rose"
              />
            </>
          )}

          {error && <p className="text-sm text-rose-dark mb-3">{error}</p>}
          {notice && <p className="text-sm text-sage-dark mb-3">{notice}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-rose text-white font-medium hover:bg-rose-dark transition disabled:opacity-50"
          >
            {busy
              ? "…"
              : mode === "signin"
                ? "sign in"
                : mode === "signup"
                  ? "create account"
                  : "send me a link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 rounded-lg transition ${
        active ? "bg-rose-light/60 text-rose-dark font-medium" : "text-ink/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
