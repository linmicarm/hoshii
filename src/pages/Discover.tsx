import { useState, useEffect } from "react";
import { useQuery } from "urql";
import { SEARCH_MEDIA, TRENDING_MEDIA } from "../lib/anilist";
import type { Media, MediaType, PageResult } from "../types/anilist";
import MediaCard from "../components/MediaCard";
import MediaDetail from "../components/MediaDetail";

export default function Discover() {
  const [type, setType] = useState<MediaType>("ANIME");
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<Media | null>(null);

  // Debounce the search term by 500ms -- AniList's free tier is ~1 req/sec,
  // so we don't want to fire a query on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 500);
    return () => clearTimeout(t);
  }, [term]);

  const searching = debounced.length > 0;

  const [result] = useQuery<PageResult>({
    query: searching ? SEARCH_MEDIA : TRENDING_MEDIA,
    variables: searching ? { search: debounced, type } : { type },
  });

  const { data, fetching, error } = result;
  const media = data?.Page.media ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h2 className="font-display text-2xl text-ink">discover</h2>

        {/* anime / manga toggle */}
        <div className="flex rounded-lg border border-rose-light overflow-hidden text-sm">
          {(["ANIME", "MANGA"] as MediaType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 transition ${
                type === t
                  ? "bg-rose text-white"
                  : "bg-cream text-ink/60 hover:bg-cream-dark"
              }`}
            >
              {t === "ANIME" ? "anime" : "manga"}
            </button>
          ))}
        </div>
      </div>

      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={`search ${type === "ANIME" ? "anime" : "manga"}...`}
        className="w-full mb-6 px-4 py-2.5 rounded-xl border border-rose-light bg-white/60 outline-none focus:border-rose"
      />

      <p className="text-xs text-ink/40 mb-3">
        {searching ? `results for "${debounced}"` : "trending right now"}
      </p>

      {error && (
        <p className="text-sm text-rose-dark">
          couldn't reach anilist right now -- try again in a moment
        </p>
      )}

      {fetching && media.length === 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-cream-dark animate-pulse" />
          ))}
        </div>
      ) : media.length === 0 && searching ? (
        <p className="text-sm text-ink/50">nothing found -- try another title</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {media.map((m) => (
            <MediaCard key={m.id} media={m} onClick={setSelected} />
          ))}
        </div>
      )}

      <MediaDetail media={selected} onClose={() => setSelected(null)} />
    </div>
  );
}