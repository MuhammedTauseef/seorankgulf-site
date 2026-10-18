import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Create a Supabase service-role client.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured —
 * callers must handle null with a 503 (not a crash).
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key);
}
