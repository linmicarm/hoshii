import { useState } from "react";
import type { Media } from "../types/anilist";
import { displayTitle, totalUnits } from "../types/anilist";
import { STATUS_LABELS, type TrackStatus } from "../types/library";
import { useLibrary } from "../lib/useLibrary";

interface Props {
  media: Media | null;
  onClose: () => void;
}

const STATUS_ORDER: TrackStatus[] = [
  "CURRENT",
  "PLANNING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
];

// Strip AniList's HTML tags for a plain-text description.
function clean(desc: string | null): string {
  if (!desc) return "";
  return desc.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export default function MediaDetail({ media, onClose }: Props) {
  const { addToLibrary, saving } = useLibrary();
  const [added, setAdded] = useState<TrackStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!media) return null;

  const cover = media.coverImage.extraLarge || media.coverImage.large || "";
  const units = totalUnits(media);
  const unitLabel = media.type === "ANIME" ? "episodes" : "chapters";

  const handleAdd = async (status: TrackStatus) => {
    setError(null);
    const err = await addToLibrary(media, status);
    if (err) setError(err);
    else setAdded(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      {/* panel */}
      <div className="relative w-full max-w-md bg-cream h-full overflow-y-auto shadow-xl">
        {media.bannerImage && (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${media.bannerImage})` }}
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream/90 text-ink/60 hover:text-ink flex items-center justify-center"
          aria-label="close"
        >
          ✕
        </button>

        <div className="p-5">
          <div className="flex gap-4 -mt-12 mb-4">
            {cover && (
              <img
                src={cover}
                alt={displayTitle(media.title)}
                className="w-24 rounded-lg shadow-md border-2 border-cream shrink-0"
              />
            )}
            <div className="pt-12">
              <h2 className="font-display text-xl text-ink leading-tight">
                {displayTitle(media.title)}
              </h2>
              {media.title.native && (
                <p className="text-xs text-ink/50 mt-0.5">{media.title.native}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-ink/60 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-rose-light/40">
              {media.type === "ANIME" ? "anime" : "manga"}
            </span>
            {media.seasonYear && (
              <span className="px-2 py-0.5 rounded-full bg-cream-dark">{media.seasonYear}</span>
            )}
            {units != null && (
              <span className="px-2 py-0.5 rounded-full bg-cream-dark">
                {units} {unitLabel}
              </span>
            )}
            {media.averageScore != null && (
              <span className="px-2 py-0.5 rounded-full bg-sage/20">♡ {media.averageScore}</span>
            )}
          </div>

          {media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {media.genres.map((g) => (
                <span key={g} className="text-[11px] text-rose-dark/80">
                  #{g.toLowerCase().replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          )}

          {media.description && (
            <p className="text-sm text-ink/70 leading-relaxed mb-6 line-clamp-6">
              {clean(media.description)}
            </p>
          )}

          {/* add to library */}
          <div className="border-t border-rose-light/50 pt-4">
            {added ? (
              <p className="text-sm text-sage-dark">
                added to your library as{" "}
                <span className="font-medium">{STATUS_LABELS[added]}</span> ♡
              </p>
            ) : (
              <>
                <p className="text-xs text-ink/50 mb-2">add to library as…</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleAdd(s)}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg text-sm border border-rose-light text-ink/70 hover:bg-rose-light/40 hover:text-rose-dark transition disabled:opacity-50"
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </>
            )}
            {error && <p className="text-sm text-rose-dark mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}