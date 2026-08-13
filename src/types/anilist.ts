// AniList GraphQL response shapes (only the fields hoshii uses)

export type MediaType = "ANIME" | "MANGA";

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export interface MediaTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface MediaCoverImage {
  extraLarge: string | null;
  large: string | null;
  color: string | null;
}

export interface Media {
  id: number;
  type: MediaType;
  format: MediaFormat | null;
  status: MediaStatus | null;
  title: MediaTitle;
  coverImage: MediaCoverImage;
  bannerImage: string | null;
  description: string | null;
  episodes: number | null; // anime
  chapters: number | null; // manga
  volumes: number | null; // manga
  genres: string[];
  averageScore: number | null;
  seasonYear: number | null;
}

export interface PageResult {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: Media[];
  };
}

export interface MediaResult {
  Media: Media;
}

// Display helper: pick the best available title
export function displayTitle(t: MediaTitle): string {
  return t.english || t.romaji || t.native || "Untitled";
}

// Total progress units for a media (episodes or chapters)
export function totalUnits(m: Media): number | null {
  return m.type === "ANIME" ? m.episodes : m.chapters;
}
