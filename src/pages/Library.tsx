import { useState, useMemo } from "react";
import { useLibraryEntries, STATUS_TABS } from "../lib/useLibraryEntries";
import { STATUS_LABELS, type TrackStatus, type LibraryEntry } from "../types/library";
import LibraryCard from "../components/LibraryCard";
import LibraryEditPanel from "../components/LibraryEditPanel";

export default function Library() {
  const { entries, loading, error, updateEntry, removeEntry, incrementProgress } =
    useLibraryEntries();
  const [tab, setTab] = useState<TrackStatus>("CURRENT");
  const [selected, setSelected] = useState<LibraryEntry | null>(null);

  // Count per status, computed once per entries change.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of entries) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [entries]);

  const shown = entries.filter((e) => e.status === tab);

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-5">library</h2>

      {/* status tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
              tab === s
                ? "bg-rose-light/50 text-rose-dark font-medium"
                : "text-ink/50 hover:bg-cream-dark"
            }`}
          >
            {STATUS_LABELS[s]}
            {counts[s] ? (
              <span className="ml-1.5 text-xs text-ink/40">{counts[s]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose-dark">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-cream-dark animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink/50 mb-1">nothing here yet</p>
          <p className="text-sm text-ink/35">
            add titles from discover to start your {STATUS_LABELS[tab]} shelf
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {shown.map((e) => (
            <LibraryCard
              key={e.id}
              entry={e}
              onOpen={setSelected}
              onIncrement={incrementProgress}
            />
          ))}
        </div>
      )}

      <LibraryEditPanel
        entry={selected}
        onClose={() => setSelected(null)}
        onSave={updateEntry}
        onRemove={removeEntry}
      />
    </div>
  );
}