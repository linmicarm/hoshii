import { useState, useEffect } from "react";
import type { LibraryEntry, TrackStatus } from "../types/library";
import { STATUS_LABELS } from "../types/library";
import { STATUS_TABS } from "../lib/useLibraryEntries";

interface Props {
  entry: LibraryEntry | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<LibraryEntry>) => Promise<string | null>;
  onRemove: (id: string) => Promise<string | null>;
}

export default function LibraryEditPanel({ entry, onClose, onSave, onRemove }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<TrackStatus>("CURRENT");
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local form state whenever a new entry opens.
  useEffect(() => {
    if (entry) {
      setProgress(entry.progress);
      setStatus(entry.status);
      setScore(entry.score);
      setConfirmRemove(false);
      setError(null);
    }
  }, [entry]);

  if (!entry) return null;

  const unitLabel = entry.media_type === "ANIME" ? "episodes" : "chapters";

  const save = async () => {
    setBusy(true);
    setError(null);
    const clamped =
      entry.total_units != null
        ? Math.max(0, Math.min(progress, entry.total_units))
        : Math.max(0, progress);
    const err = await onSave(entry.id, { progress: clamped, status, score });
    setBusy(false);
    if (err) setError(err);
    else onClose();
  };

  const remove = async () => {
    setBusy(true);
    const err = await onRemove(entry.id);
    setBusy(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-cream h-full overflow-y-auto shadow-xl p-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream-dark text-ink/60 hover:text-ink flex items-center justify-center"
          aria-label="close"
        >
          ✕
        </button>

        <div className="flex gap-3 mb-5">
          {entry.cover_image && (
            <img
              src={entry.cover_image}
              alt={entry.title}
              className="w-20 rounded-lg shadow shrink-0"
            />
          )}
          <div>
            <h2 className="font-display text-lg text-ink leading-tight">{entry.title}</h2>
            <p className="text-xs text-ink/50 mt-1">
              {entry.media_type === "ANIME" ? "anime" : "manga"}
            </p>
          </div>
        </div>

        {/* status */}
        <label className="block text-xs text-ink/60 mb-1.5">status</label>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                status === s
                  ? "bg-rose text-white"
                  : "border border-rose-light text-ink/60 hover:bg-rose-light/40"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* progress */}
        <label className="block text-xs text-ink/60 mb-1.5">
          progress ({unitLabel})
        </label>
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setProgress((p) => Math.max(0, p - 1))}
            className="w-9 h-9 rounded-lg border border-rose-light text-ink/60 hover:bg-rose-light/40"
          >
            −
          </button>
          <input
            type="number"
            value={progress}
            min={0}
            max={entry.total_units ?? undefined}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-20 text-center px-2 py-2 rounded-lg border border-rose-light bg-white/60 outline-none focus:border-rose"
          />
          <button
            onClick={() =>
              setProgress((p) =>
                entry.total_units != null ? Math.min(p + 1, entry.total_units) : p + 1
              )
            }
            className="w-9 h-9 rounded-lg border border-rose-light text-ink/60 hover:bg-rose-light/40"
          >
            +
          </button>
          {entry.total_units != null && (
            <span className="text-sm text-ink/40">of {entry.total_units}</span>
          )}
        </div>

        {/* score */}
        <label className="block text-xs text-ink/60 mb-1.5">your score</label>
        <div className="flex flex-wrap gap-1 mb-6">
          <button
            onClick={() => setScore(null)}
            className={`px-2.5 py-1 rounded-lg text-sm transition ${
              score == null
                ? "bg-sage/30 text-sage-dark"
                : "text-ink/40 hover:bg-cream-dark"
            }`}
          >
            —
          </button>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setScore(n)}
              className={`w-8 h-8 rounded-lg text-sm transition ${
                score === n
                  ? "bg-rose text-white"
                  : "border border-rose-light text-ink/60 hover:bg-rose-light/40"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-rose-dark mb-3">{error}</p>}

        <button
          onClick={save}
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-rose text-white font-medium hover:bg-rose-dark transition disabled:opacity-50 mb-3"
        >
          {busy ? "…" : "save"}
        </button>

        {confirmRemove ? (
          <div className="flex gap-2">
            <button
              onClick={remove}
              disabled={busy}
              className="flex-1 py-2 rounded-lg bg-rose-dark/10 text-rose-dark text-sm hover:bg-rose-dark/20"
            >
              yes, remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="flex-1 py-2 rounded-lg text-ink/50 text-sm hover:bg-cream-dark"
            >
              keep it
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmRemove(true)}
            className="w-full py-2 text-sm text-ink/40 hover:text-rose-dark transition"
          >
            remove from library
          </button>
        )}
      </div>
    </div>
  );
}