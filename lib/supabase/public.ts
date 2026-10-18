import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for PUBLIC reads (no cookies).
 * Uses the anon key — safe for build-time and public pages.
 * RLS policies control what this key can access.
 * Returns null if env vars are missing (build-time safety).
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}
