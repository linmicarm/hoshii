import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { Media } from "../types/anilist";
import { displayTitle, totalUnits } from "../types/anilist";
import type { TrackStatus } from "../types/library";

// Handles writing a title into the user's library. Caches AniList
// display fields on the row so the library grid renders without
// re-hitting the API.
export function useLibrary() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const addToLibrary = useCallback(
    async (media: Media, status: TrackStatus): Promise<string | null> => {
      if (!user) return "you must be signed in";
      setSaving(true);

      const row = {
        user_id: user.id,
        media_id: media.id,
        media_type: media.type,
        title: displayTitle(media.title),
        cover_image: media.coverImage.extraLarge || media.coverImage.large,
        cover_color: media.coverImage.color,
        total_units: totalUnits(media),
        status,
        progress: 0,
      };

      // Chain .select() so Supabase returns the written row (or a real
      // error). Without it, a row rejected by RLS can resolve silently.
      const { data, error } = await supabase
        .from("library_entries")
        .upsert(row, { onConflict: "user_id,media_id,media_type" })
        .select();

      setSaving(false);

      if (error) {
        console.error("[hoshii] addToLibrary error:", error);
        return error.message;
      }
      if (!data || data.length === 0) {
        console.error("[hoshii] addToLibrary wrote no rows — likely RLS", { row });
        return "couldn't save — check that you're signed in";
      }
      console.log("[hoshii] saved row:", data[0]);
      return null;
    },
    [user]
  );

  return { addToLibrary, saving };
}