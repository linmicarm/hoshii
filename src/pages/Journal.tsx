import { useState } from "react";
import { useJournal } from "../lib/useJournal";
import { MOOD_BY_KEY, type Mood } from "../types/library";
import MoodPicker from "../components/MoodPicker";
import TitlePicker, { type PickedTitle } from "../components/TitlePicker";

export default function Journal() {
  const { entries, loading, addEntry, removeEntry } = useJournal();
  const [writing, setWriting] = useState(false);

  // draft state
  const [title, setTitle] = useState<PickedTitle | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [atUnit, setAtUnit] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle(null);
    setMood(null);
    setAtUnit("");
    setNote("");
    setError(null);
    setWriting(false);
  };

  const save = async () => {
    setError(null);
    if (!title) {
      setError("pick a title first");
      return;
    }
    if (!mood) {
      setError("choose a mood");
      return;
    }
    setBusy(true);
    const err = await addEntry({
      media_id: title.media_id,
      media_type: title.media_type,
      title: title.title,
      mood,
      at_unit: atUnit.trim() ? Number(atUnit) : null,
      note: note.trim(),
    });
    setBusy(false);
    if (err) setError(err);
    else reset();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl text-ink">journal</h2>
        {!writing && (
          <button
            onClick={() => setWriting(true)}
            className="px-4 py-1.5 rounded-lg bg-rose text-white text-sm font-medium hover:bg-rose-dark transition"
          >
            write a reflection
          </button>
        )}
      </div>

      {/* write flow */}
      {writing && (
        <div className="rounded-2xl border border-rose-light/60 bg-white/50 p-5 mb-8">
          <label className="block text-xs text-ink/60 mb-1.5">what did you watch?</label>
          <div className="mb-4">
            <TitlePicker value={title} onChange={setTitle} />
          </div>

          <label className="block text-xs text-ink/60 mb-1.5">how did it leave you?</label>
          <div className="mb-4">
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          <label className="block text-xs text-ink/60 mb-1.5">
            episode / chapter (optional)
          </label>
          <input
            value={atUnit}
            onChange={(e) => setAtUnit(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 12"
            className="w-28 mb-4 px-3 py-2 rounded-lg border border-rose-light bg-white/60 outline-none focus:border-rose text-sm"
          />

          <label className="block text-xs text-ink/60 mb-1.5">your reflection</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="what stayed with you?"
            className="w-full mb-4 px-3 py-2 rounded-lg border border-rose-light bg-white/60 outline-none focus:border-rose text-sm resize-none"
          />

          {error && <p className="text-sm text-rose-dark mb-3">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="px-5 py-2 rounded-lg bg-rose text-white text-sm font-medium hover:bg-rose-dark transition disabled:opacity-50"
            >
              {busy ? "saving…" : "save reflection"}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg text-ink/50 text-sm hover:bg-cream-dark transition"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* gentle prompt when not writing and empty */}
      {!writing && !loading && entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink/50 mb-1">no reflections yet</p>
          <p className="text-sm text-ink/35">
            the things you watch leave something behind — write the first one down ♡
          </p>
        </div>
      )}

      {/* recent entries */}
      {entries.length > 0 && (
        <div>
          <p className="text-xs text-ink/40 mb-3">recent reflections</p>
          <div className="space-y-3">
            {entries.map((e) => {
              const m = MOOD_BY_KEY[e.mood];
              return (
                <div
                  key={e.id}
                  className="group rounded-xl border border-rose-light/50 bg-white/40 p-4"
                  style={{ borderLeftWidth: "3px", borderLeftColor: m?.color }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{m?.emoji}</span>
                    <span className="text-sm font-medium text-ink">{e.title}</span>
                    {e.at_unit != null && (
                      <span className="text-xs text-ink/40">
                        · {e.media_type === "ANIME" ? "ep" : "ch"} {e.at_unit}
                      </span>
                    )}
                    <span
                      className="text-xs ml-auto px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: (m?.color ?? "#ccc") + "22", color: m?.color }}
                    >
                      {m?.label}
                    </span>
                  </div>
                  {e.note && (
                    <p className="text-sm text-ink/70 leading-relaxed">{e.note}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-ink/30">
                      {new Date(e.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => removeEntry(e.id)}
                      className="text-[11px] text-ink/30 hover:text-rose-dark opacity-0 group-hover:opacity-100 transition"
                    >
                      delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}