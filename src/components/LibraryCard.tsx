import type { LibraryEntry } from "../types/library";

interface Props {
  entry: LibraryEntry;
  onOpen: (e: LibraryEntry) => void;
  onIncrement: (e: LibraryEntry) => void;
}

// A library tile: cover, progress bar along the bottom, and a
// quick +1 button that appears on hover.
export default function LibraryCard({ entry, onOpen, onIncrement }: Props) {
  const cover = entry.cover_image || "";
  const accent = entry.cover_color || "#c9a5a0";
  const unitLabel = entry.media_type === "ANIME" ? "ep" : "ch";
  const pct =
    entry.total_units && entry.total_units > 0
      ? Math.min(100, Math.round((entry.progress / entry.total_units) * 100))
      : entry.progress > 0
        ? 100
        : 0;
  const atMax = entry.total_units != null && entry.progress >= entry.total_units;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-cream-dark aspect-[2/3]">
      <button
        onClick={() => onOpen(entry)}
        className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-rose rounded-xl"
        aria-label={`open ${entry.title}`}
      >
        {cover ? (
          <img
            src={cover}
            alt={entry.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">
            {entry.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent pt-8 pb-2 px-2">
          <p className="text-white text-[11px] font-medium leading-snug line-clamp-2 mb-1">
            {entry.title}
          </p>
          <div className="flex items-center justify-between text-[10px] text-white/80 mb-1">
            <span>
              {entry.progress}
              {entry.total_units != null ? `/${entry.total_units}` : ""} {unitLabel}
            </span>
            {entry.score != null && <span>♡ {entry.score}</span>}
          </div>
          <div className="h-1 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: accent }}
            />
          </div>
        </div>
      </button>

      {/* quick +1 */}
      {!atMax && (
        <button
          onClick={() => onIncrement(entry)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-cream/90 text-rose-dark text-sm font-medium opacity-0 group-hover:opacity-100 transition hover:bg-white flex items-center justify-center shadow"
          aria-label="watched one more"
        >
          +1
        </button>
      )}
    </div>
  );
}