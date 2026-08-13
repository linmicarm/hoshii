import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useJournal } from "../lib/useJournal";
import { useLibraryEntries } from "../lib/useLibraryEntries";
import { MOOD_BY_KEY } from "../types/library";
import type { Mood, JournalEntry } from "../types/library";

// The mood you've been in most across your last 10 reflections.
function recentMood(entries: JournalEntry[]): Mood | null {
  if (entries.length === 0) return null;
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
  return dominant;
}

// Cards that read from data you've already built.
const DOORS = [
  { to: "/discover", emoji: "\ud83d\udd0d", label: "discover", blurb: "find something new" },
  { to: "/journal", emoji: "\u270f\ufe0f", label: "journal", blurb: "write a reflection" },
  { to: "/archive", emoji: "\ud83e\ude9e", label: "archive", blurb: "revisit how it felt" },
];

export default function Home() {
  const { entries, loading: jLoading } = useJournal();
  const { entries: library } = useLibraryEntries();

  const latest = entries[0] ?? null;
  const mood = useMemo(() => recentMood(entries), [entries]);
  const watching = useMemo(
    () => library.filter((e) => e.status === "CURRENT").slice(0, 6),
    [library]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* greeting */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-display font-medium text-ink tracking-tight">hoshii</h1>
        <p className="text-sm text-ink/50 mt-1">
          a soft place to keep what you felt. ♡
        </p>
      </header>

      {/* mood-of-the-moment glance */}
      {mood && (
        <section
          className="glass p-5 mb-6 text-center"
          style={{
            borderColor: `${MOOD_BY_KEY[mood].color}55`,
          }}
        >
          <div className="text-3xl mb-1">{MOOD_BY_KEY[mood].emoji}</div>
          <p className="text-xs uppercase tracking-wide text-ink/40">lately you've been</p>
          <p
            className="text-lg font-display font-medium"
            style={{ color: MOOD_BY_KEY[mood].color }}
          >
            {MOOD_BY_KEY[mood].label}
          </p>
          <p className="text-sm text-ink/50 italic mt-0.5">
            {MOOD_BY_KEY[mood].phrase}
          </p>
        </section>
      )}

      {/* most recent reflection */}
      {!jLoading && latest && (
        <section className="glass p-5 mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
            your last reflection
          </p>
          <Link
            to="/archive"
            className="block glass-inner p-4 hover:shadow-sm transition"
            style={{
              borderLeftColor: MOOD_BY_KEY[latest.mood].color,
              borderLeftWidth: 3,
            }}
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className="text-sm font-medium"
                style={{ color: MOOD_BY_KEY[latest.mood].color }}
              >
                {MOOD_BY_KEY[latest.mood].emoji} {MOOD_BY_KEY[latest.mood].label}
              </span>
              <span className="text-sm text-ink font-medium">{latest.title}</span>
            </div>
            {latest.note && (
              <p className="text-sm text-ink/70 mt-1 line-clamp-2 whitespace-pre-wrap">
                {latest.note}
              </p>
            )}
          </Link>
        </section>
      )}

      {/* currently watching / reading */}
      {watching.length > 0 && (
        <section className="glass p-5 mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
            currently watching &amp; reading
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {watching.map((e) => (
              <Link
                key={e.id}
                to="/library"
                className="shrink-0 w-20 group"
                title={e.title}
              >
                {e.cover_image ? (
                  <img
                    src={e.cover_image}
                    alt={e.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-sm group-hover:shadow-md transition"
                  />
                ) : (
                  <div className="w-20 h-28 rounded-lg bg-rose-light/30 flex items-center justify-center text-2xl">
                    {"\ud83c\udf75"}
                  </div>
                )}
                <p className="text-xs text-ink/60 mt-1 line-clamp-2 leading-tight">
                  {e.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* quick doors */}
      <section className="grid grid-cols-3 gap-3">
        {DOORS.map((d) => (
          <Link
            key={d.to}
            to={d.to}
            className="glass-door p-4 text-center"
          >
            <div className="text-2xl mb-1">{d.emoji}</div>
            <p className="text-sm font-medium text-ink">{d.label}</p>
            <p className="text-xs text-ink/40 mt-0.5">{d.blurb}</p>
          </Link>
        ))}
      </section>

      {/* first-run: nothing yet */}
      {!jLoading && entries.length === 0 && watching.length === 0 && (
        <p className="text-sm text-ink/40 text-center mt-8">
          nothing here yet — start by discovering a title or writing your first reflection.
        </p>
      )}
    </div>
  );
}