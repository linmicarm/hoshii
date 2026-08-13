import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { LibraryEntry, TrackStatus } from "../types/library";

// Fetches the signed-in user's library and exposes mutations.
// Mutations update local state optimistically after the DB write
// confirms, so the grid stays in sync without a full refetch.
export function useLibraryEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("library_entries")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) setError(error.message);
    else setEntries((data ?? []) as LibraryEntry[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Patch a subset of fields on one entry.
  const updateEntry = useCallback(
    async (id: string, patch: Partial<LibraryEntry>): Promise<string | null> => {
      const { data, error } = await supabase
        .from("library_entries")
        .update(patch)
        .eq("id", id)
        .select();
      if (error) return error.message;
      if (data && data[0]) {
        const updated = data[0] as LibraryEntry;
        setEntries((prev) =>
          prev
            .map((e) => (e.id === id ? updated : e))
            .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
        );
      }
      return null;
    },
    []
  );

  const removeEntry = useCallback(async (id: string): Promise<string | null> => {
    const { error } = await supabase.from("library_entries").delete().eq("id", id);
    if (error) return error.message;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    return null;
  }, []);

  // Bump progress by one, clamped to total_units when known.
  const incrementProgress = useCallback(
    async (entry: LibraryEntry): Promise<string | null> => {
      const next =
        entry.total_units != null
          ? Math.min(entry.progress + 1, entry.total_units)
          : entry.progress + 1;
      if (next === entry.progress) return null;

      // Auto-complete when the last unit is reached.
      const patch: Partial<LibraryEntry> = { progress: next };
      if (entry.total_units != null && next === entry.total_units) {
        patch.status = "COMPLETED";
      }
      return updateEntry(entry.id, patch);
    },
    [updateEntry]
  );

  return {
    entries,
    loading,
    error,
    reload: load,
    updateEntry,
    removeEntry,
    incrementProgress,
  };
}

export const STATUS_TABS: TrackStatus[] = [
  "CURRENT",
  "PLANNING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
];