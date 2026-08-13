import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

const NAV = [
  { to: "/", label: "home", icon: "✿", end: true },
  { to: "/library", label: "library", icon: "❀", end: false },
  { to: "/discover", label: "discover", icon: "✦", end: false },
  { to: "/journal", label: "journal", icon: "✎", end: false },
  { to: "/archive", label: "archive", icon: "❁", end: false },
];

export default function AppShell() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      {/* desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 border-r border-rose-light/50 px-4 py-6">
        <h1 className="font-display text-3xl text-rose-dark px-2 mb-8">hoshii</h1>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-rose-light/50 text-rose-dark font-medium"
                    : "text-ink/60 hover:bg-cream-dark hover:text-ink"
                }`
              }
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 px-3 pt-4 border-t border-rose-light/40">
          <p className="text-xs text-ink/40 truncate mb-2">{user?.email}</p>
          <button
            onClick={signOut}
            className="text-xs text-ink/50 hover:text-rose-dark transition"
          >
            sign out
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 px-5 py-6 md:px-10 md:py-8 pb-24 md:pb-8">
        {/* mobile header */}
        <h1 className="md:hidden font-display text-2xl text-rose-dark mb-5">hoshii</h1>
        <Outlet />
      </main>

      {/* mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-cream/95 backdrop-blur border-t border-rose-light/50 flex justify-around py-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] transition ${
                isActive ? "text-rose-dark font-medium" : "text-ink/50"
              }`
            }
          >
            <span className="text-lg leading-none">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
