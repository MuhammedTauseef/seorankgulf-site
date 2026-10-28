/**
 * Google OAuth provider availability pre-check.
 *
 * Why this exists: Supabase's signInWithOAuth navigates the browser
 * straight to `{SUPABASE_URL}/auth/v1/authorize?provider=google`. While
 * the Google provider is DISABLED in the Supabase dashboard, that URL
 * answers with a raw JSON error page ("Unsupported provider: provider
 * is not enabled") instead of redirecting back to the site — the user
 * is stranded on an ugly error with no way back. The public settings
 * endpoint exposes the enabled external providers, so the button can
 * check first and show the friendly in-page message instead.
 *
 * The check is advisory only: anything other than an explicit
 * "google: false" (fetch failure, non-200, unexpected payload shape)
 * is "unknown" and the caller proceeds with the OAuth attempt exactly
 * as before — a failed pre-check must never block a working login.
 */
export type GoogleProviderStatus = "enabled" | "disabled" | "unknown";

/** Parse a Supabase /auth/v1/settings payload into a provider status. */
export function googleProviderStatusFromSettings(
  data: unknown
): GoogleProviderStatus {
  if (data && typeof data === "object") {
    const external = (data as { external?: unknown }).external;
    if (external && typeof external === "object") {
      const google = (external as { google?: unknown }).google;
      if (google === true) return "enabled";
      if (google === false) return "disabled";
    }
  }
  return "unknown";
}

/**
 * Ask Supabase's public settings endpoint whether the Google provider
 * is enabled. Uses the same public URL + anon key as the browser
 * client (lib/supabase/client) — both are safe to expose. Never
 * throws: any failure resolves to "unknown".
 */
export async function fetchGoogleProviderStatus(
  supabaseUrl: string,
  anonKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<GoogleProviderStatus> {
  try {
    const base = supabaseUrl.replace(/\/+$/, "");
    const res = await fetchImpl(`${base}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    if (!res.ok) return "unknown";
    const data: unknown = await res.json();
    return googleProviderStatusFromSettings(data);
  } catch {
    return "unknown";
  }
}
