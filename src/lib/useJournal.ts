import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { JournalEntry, Mood } from "../types/library";
import type { MediaType } from "../types/anilist";

export interface NewJournalInput {
  media_id: number;
  media_type: MediaType;
  title: string;
  mood: Mood;
  at_unit: number | null;
  note: string;
}

// Fetches and mutates the user's journal reflections.
export function useJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setEntries((data ?? []) as JournalEntry[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (input: NewJournalInput): Promise<string | null> => {
      if (!user) return "you must be signed in";
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ ...input, user_id: user.id })
        .select();
      if (error) return error.message;
      if (data && data[0]) {
        setEntries((prev) => [data[0] as JournalEntry, ...prev]);
      }
      return null;
    },
    [user]
  );

  const removeEntry = useCallback(async (id: string): Promise<string | null> => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) return error.message;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    return null;
  }, []);

  return { entries, loading, error, addEntry, removeEntry, reload: load };
}