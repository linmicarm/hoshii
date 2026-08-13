// hoshii's own domain types (stored in Supabase)

import type { MediaType } from "./anilist";

export type TrackStatus =
  | "CURRENT" // watching / reading
  | "COMPLETED"
  | "PLANNING" // plan to watch / read
  | "PAUSED" // on hold
  | "DROPPED";

export const STATUS_LABELS: Record<TrackStatus, string> = {
  CURRENT: "watching",
  COMPLETED: "completed",
  PLANNING: "plan to",
  PAUSED: "on hold",
  DROPPED: "dropped",
};

// -- moods: hoshii's emotional vocabulary --------------------------
// Not just tags -- each mood is a small object with its own color,
// a first-person phrase (how it feels), and a "prescription"
// (why you needed it). This vocabulary powers mood-filtered discovery,
// the emotional-archive view, and "prescribe me something" mode.

export type Mood =
  | "cozy"
  | "moved"
  | "thrilled"
  | "bittersweet"
  | "comforted"
  | "restless"
  | "hollow"
  | "nostalgic"
  | "enchanted"
  | "hopeful"
  | "yearning"
  | "restored"
  | "seen";

export interface MoodDef {
  key: Mood;
  emoji: string;
  label: string;
  color: string; // brand-adjacent hex, tuned to the rose/cream/sage world
  phrase: string; // first-person: how it feels
  prescription: string; // second-person: why you needed it
}

export const MOODS: MoodDef[] = [
  { key: "cozy", emoji: "\ud83c\udf75", label: "cozy", color: "#d8a48f", phrase: "i want to curl up here.", prescription: "you needed something soft." },
  { key: "moved", emoji: "\ud83c\udf19", label: "moved", color: "#8e9bbf", phrase: "that touched me.", prescription: "you needed to feel it." },
  { key: "thrilled", emoji: "\u2728", label: "thrilled", color: "#e0a53f", phrase: "i couldn't sit still.", prescription: "you needed a spark." },
  { key: "bittersweet", emoji: "\ud83c\udf42", label: "bittersweet", color: "#c98a5e", phrase: "happy and sad at once.", prescription: "you needed the ache and the warmth." },
  { key: "comforted", emoji: "\ud83e\udec2", label: "comforted", color: "#c99aa6", phrase: "that made me feel safe.", prescription: "you needed to be held." },
  { key: "restless", emoji: "\ud83c\udf0a", label: "restless", color: "#6fa3a0", phrase: "i need more.", prescription: "you needed to be stirred." },
  { key: "hollow", emoji: "\ud83d\udd6f\ufe0f", label: "hollow", color: "#9a8f88", phrase: "the ache after the ending.", prescription: "you needed to sit with the empty." },
  { key: "nostalgic", emoji: "\ud83d\udcfc", label: "nostalgic", color: "#c7a86b", phrase: "i was somewhere i used to be.", prescription: "you needed to visit an old self." },
  { key: "enchanted", emoji: "\ud83e\ude84", label: "enchanted", color: "#a58fc9", phrase: "i want to live there.", prescription: "you needed a little magic." },
  { key: "hopeful", emoji: "\ud83c\udf31", label: "hopeful", color: "#8fb07a", phrase: "maybe things get better.", prescription: "you needed to believe it could." },
  { key: "yearning", emoji: "\ud83d\udc8c", label: "yearning", color: "#d98fa8", phrase: "i want what i can't name.", prescription: "you needed to long for something." },
  { key: "restored", emoji: "\ud83e\udee7", label: "restored", color: "#88bcc4", phrase: "i feel like myself again.", prescription: "you needed your hp back." },
  { key: "seen", emoji: "\ud83e\ude9e", label: "seen", color: "#b98fb0", phrase: "this understood me.", prescription: "you needed to be reflected." },
];

// Fast lookup by key -- for rendering a stored entry's mood.
export const MOOD_BY_KEY: Record<Mood, MoodDef> = MOODS.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<Mood, MoodDef>
);

// A row in the user's library
export interface LibraryEntry {
  id: string; // uuid
  user_id: string;
  media_id: number; // AniList id
  media_type: MediaType;
  // cached AniList display data so the library renders without a network call
  title: string;
  cover_image: string | null;
  cover_color: string | null;
  total_units: number | null;
  status: TrackStatus;
  progress: number; // episodes watched / chapters read
  score: number | null; // personal 1-10
  created_at: string;
  updated_at: string;
}

// A journal reflection attached to a title (optionally a specific episode/chapter)
export interface JournalEntry {
  id: string; // uuid
  user_id: string;
  media_id: number;
  media_type: MediaType;
  title: string; // cached
  mood: Mood;
  at_unit: number | null; // which episode/chapter this reflects on, if any
  note: string;
  created_at: string;
}
