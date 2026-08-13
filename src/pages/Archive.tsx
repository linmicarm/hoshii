import { useState, useMemo } from "react";
import { useJournal } from "../lib/useJournal";
import { MOODS, MOOD_BY_KEY } from "../types/library";
import type { Mood, JournalEntry } from "../types/library";

// Group entries by mood key for counts + filtering.
function countByMood(entries: JournalEntry[]): Record<Mood, number> {
  const counts = {} as Record<Mood, number>;
  for (const m of MOODS) counts[m.key] = 0;
  for (const e of entries) {
    if (counts[e.mood] !== undefined) counts[e.mood] += 1;
  }
  return counts;
}

// Formats a stored ISO date as a gentle, lowercase label.
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    .toLowerCase();
}

// Reads recent entries, finds the dominant recent mood, and picks a title
// carried by that mood — a reflection you already had in that feeling.
interface Prescription {
  mood: (typeof MOODS)[number];
  title: string;
  at_unit: number | null;
}

function prescribe(entries: JournalEntry[], seed: number): Prescription | null {
  if (entries.length === 0) return null;
  // "recent" = the last 10 reflections (entries arrive newest-first).
  const recent = entries.slice(0, 10);
  const tally = {} as Record<Mood, number>;
  for (const e of recent) tally[e.mood] = (tally[e.mood] ?? 0) + 1;

  let dominant: Mood = recent[0].mood;
  let best = -1;
  for (const key of Object.keys(tally) as Mood[]) {
    if (tally[key] > best) {
      best = tally[key];
      dominant = key;
    }
  }

  const inMood = entries.filter((e) => e.mood === dominant);
  if (inMood.length === 0) return null;
  const pick = inMood[seed % inMood.length];
  return { mood: MOOD_BY_KEY[dominant], title: pick.title, at_unit: pick.at_unit };
}

export default function Archive() {
  const { entries, loading } = useJournal();
  const [active, setActive] = useState<Mood | null>(null);
  const [seed, setSeed] = useState(0);
  const [showRx, setShowRx] = useState(false);

  const counts = useMemo(() => countByMood(entries), [entries]);
  const filtered = useMemo(
    () => (active ? entries.filter((e) => e.mood === active) : entries),
    [entries, active]
  );
  const rx = useMemo(() => prescribe(entries, seed), [entries, seed]);

  if (loading) {
    return <p className="text-sm text-ink/40 py-8 text-center">gathering your reflections…</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-medium text-ink mb-1">archive</h1>
        <p className="text-sm text-ink/50">
          every reflection you've written, colored by how it felt.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl bg-cream-dark/40 border border-rose-light/40 p-8 text-center">
          <p className="text-sm text-ink/60">
            no reflections yet — write one in the journal and it'll live here.
          </p>
        </div>
      ) : (
        <>
          {/* prescribe me something */}
          <section className="mb-6">
            {!showRx ? (
              <button
                onClick={() => {
                  setSeed((s) => s + 1);
                  setShowRx(true);
                }}
                className="w-full rounded-xl border border-rose-light bg-rose-light/20 hover:bg-rose-light/30 transition py-3 text-sm font-medium text-rose-dark"
              >
                prescribe me something ♡
              </button>
            ) : rx ? (
              <div
                className="rounded-xl p-4 border"
                style={{
                  borderColor: rx.mood.color,
                  backgroundColor: `${rx.mood.color}14`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{rx.mood.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-ink/40 mb-0.5">
                      lately you've felt {rx.mood.label}
                    </p>
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: rx.mood.color }}
                    >
                      {rx.mood.prescription}
                    </p>
                    <p className="text-sm text-ink/70">
                      revisit{" "}
                      <span className="font-medium text-ink">{rx.title}</span>
                      {rx.at_unit != null && (
                        <span className="text-ink/40"> · #{rx.at_unit}</span>
                      )}
                      .
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    onClick={() => setSeed((s) => s + 1)}
                    className="text-xs text-ink/50 hover:text-rose-dark px-2 py-1"
                  >
                    another
                  </button>
                  <button
                    onClick={() => setShowRx(false)}
                    className="text-xs text-ink/40 hover:text-ink/70 px-2 py-1"
                  >
                    close
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/40 py-2 text-center">
                write a few reflections first, then i can prescribe something.
              </p>
            )}
          </section>

          {/* mood filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MOODS.map((m) => {
              const n = counts[m.key];
              const isActive = active === m.key;
              const dim = n === 0 && !isActive;
              return (
                <button
                  key={m.key}
                  onClick={() => setActive(isActive ? null : m.key)}
                  disabled={n === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition border ${
                    dim ? "opacity-40 cursor-default" : "hover:shadow-sm"
                  }`}
                  style={{
                    borderColor: isActive ? m.color : "transparent",
                    backgroundColor: isActive ? `${m.color}22` : "#00000008",
                    color: isActive ? m.color : undefined,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                  {n > 0 && <span className="text-xs opacity-60">{n}</span>}
                </button>
              );
            })}
            {active && (
              <button
                onClick={() => setActive(null)}
                className="px-3 py-1.5 rounded-full text-sm text-ink/40 hover:text-rose-dark"
              >
                clear
              </button>
            )}
          </div>

          {/* reflections */}
          <div className="space-y-3">
            {filtered.map((e) => {
              const mood = MOOD_BY_KEY[e.mood];
              return (
                <article
                  key={e.id}
                  className="rounded-xl bg-white/60 border border-rose-light/30 p-4 flex gap-3"
                  style={{ borderLeftColor: mood.color, borderLeftWidth: 3 }}
                >
                  <span className="text-xl leading-none mt-0.5">{mood.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-sm font-medium"
                        style={{ color: mood.color }}
                      >
                        {mood.label}
                      </span>
                      <span className="text-xs text-ink/40 italic">{mood.phrase}</span>
                    </div>
                    <p className="text-sm text-ink font-medium mt-0.5">
                      {e.title}
                      {e.at_unit != null && (
                        <span className="text-ink/40 font-normal"> · #{e.at_unit}</span>
                      )}
                    </p>
                    {e.note && (
                      <p className="text-sm text-ink/70 mt-1 whitespace-pre-wrap">{e.note}</p>
                    )}
                    <p className="text-xs text-ink/30 mt-2">{formatDate(e.created_at)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}