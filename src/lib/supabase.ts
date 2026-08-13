import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // Fail loud in dev so a missing .env is obvious, not a silent 401 later.
  console.warn(
    "[hoshii] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env.local"
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
