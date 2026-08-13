import { useState, useEffect } from "react";
import { useQuery } from "urql";
import { SEARCH_MEDIA } from "../lib/anilist";
import type { Media, MediaType, PageResult } from "../types/anilist";
import { displayTitle } from "../types/anilist";
import { useLibraryEntries } from "../lib/useLibraryEntries";

// A chosen title, normalized from either a library entry or a search result.
export interface PickedTitle {
  media_id: number;
  media_type: MediaType;
  title: string;
  cover_image: string | null;
}

interface Props {
  value: PickedTitle | null;
  onChange: (t: PickedTitle | null) => void;
}

export default function TitlePicker({ value, onChange }: Props) {
  const [mode, setMode] = useState<"library" | "search">("library");
  const { entries } = useLibraryEntries();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 500);
    return () => clearTimeout(t);
  }, [term]);

  const [result] = useQuery<PageResult>({
    query: SEARCH_MEDIA,
    variables: { search: debounced, type: "ANIME" as MediaType },
    pause: mode !== "search" || debounced.length === 0,
  });
  const searchResults = result.data?.Page.media ?? [];

  if (value) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-rose-light/25">
        {value.cover_image && (
          <img src={value.cover_image} alt={value.title} className="w-10 rounded shadow-sm" />
        )}
        <span className="flex-1 text-sm text-ink font-medium">{value.title}</span>
        <button
          onClick={() => onChange(null)}
          className="text-xs text-ink/50 hover:text-rose-dark px-2"
        >
          change
        </button>
      </div>
    );
  }

  const pickFromMedia = (m: Media) =>
    onChange({
      media_id: m.id,
      media_type: m.type,
      title: displayTitle(m.title),
      cover_image: m.coverImage.large || m.coverImage.extraLarge,
    });

  return (
    <div>
      <div className="flex gap-1 mb-2 text-sm">
        <button
          onClick={() => setMode("library")}
          className={`px-3 py-1 rounded-lg transition ${
            mode === "library"
              ? "bg-rose-light/50 text-rose-dark font-medium"
              : "text-ink/50 hover:bg-cream-dark"
          }`}
        >
          from library
        </button>
        <button
          onClick={() => setMode("search")}
          className={`px-3 py-1 rounded-lg transition ${
            mode === "search"
              ? "bg-rose-light/50 text-rose-dark font-medium"
              : "text-ink/50 hover:bg-cream-dark"
          }`}
        >
          search any title
        </button>
      </div>

      {mode === "library" ? (
        entries.length === 0 ? (
          <p className="text-sm text-ink/40 py-2">
            your library is empty — try searching instead
          </p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-rose-light/50 divide-y divide-rose-light/30">
            {entries.map((e) => (
              <button
                key={e.id}
                onClick={() =>
                  onChange({
                    media_id: e.media_id,
                    media_type: e.media_type,
                    title: e.title,
                    cover_image: e.cover_image,
                  })
                }
                className="flex items-center gap-3 w-full p-2 text-left hover:bg-rose-light/20 transition"
              >
                {e.cover_image && (
                  <img src={e.cover_image} alt={e.title} className="w-8 rounded shadow-sm" />
                )}
                <span className="text-sm text-ink/80">{e.title}</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="search anime or manga…"
            className="w-full mb-2 px-3 py-2 rounded-lg border border-rose-light bg-white/60 outline-none focus:border-rose text-sm"
          />
          {result.fetching && <p className="text-sm text-ink/40 py-1">searching…</p>}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-rose-light/50 divide-y divide-rose-light/30">
              {searchResults.slice(0, 12).map((m) => (
                <button
                  key={m.id}
                  onClick={() => pickFromMedia(m)}
                  className="flex items-center gap-3 w-full p-2 text-left hover:bg-rose-light/20 transition"
                >
                  {m.coverImage.large && (
                    <img
                      src={m.coverImage.large}
                      alt={displayTitle(m.title)}
                      className="w-8 rounded shadow-sm"
                    />
                  )}
                  <span className="text-sm text-ink/80">{displayTitle(m.title)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}