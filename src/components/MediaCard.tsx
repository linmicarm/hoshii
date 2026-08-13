import type { Media } from "../types/anilist";
import { displayTitle, totalUnits } from "../types/anilist";

interface Props {
  media: Media;
  onClick: (m: Media) => void;
}

// A cozy cover tile. Cover fills the card; title + meta fade in on hover.
export default function MediaCard({ media, onClick }: Props) {
  const cover = media.coverImage.extraLarge || media.coverImage.large || "";
  const accent = media.coverImage.color || "#c9a5a0";
  const units = totalUnits(media);
  const unitLabel = media.type === "ANIME" ? "ep" : "ch";

  return (
    <button
      onClick={() => onClick(media)}
      className="group relative block w-full aspect-[2/3] rounded-xl overflow-hidden bg-cream-dark text-left focus:outline-none focus:ring-2 focus:ring-rose"
      style={{ borderColor: accent }}
    >
      {cover ? (
        <img
          src={cover}
          alt={displayTitle(media.title)}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-ink/30 text-xs">
          no cover
        </div>
      )}

      {/* hover veil + details */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-1 group-hover:translate-y-0">
        <p className="text-white text-xs font-medium leading-snug line-clamp-3">
          {displayTitle(media.title)}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/75">
          {media.seasonYear && <span>{media.seasonYear}</span>}
          {units != null && (
            <span>
              {units} {unitLabel}
            </span>
          )}
          {media.averageScore != null && <span>♡ {media.averageScore}</span>}
        </div>
      </div>
    </button>
  );
}