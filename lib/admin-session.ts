import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Establish a REAL admin session server-side and return it as a Cookie
 * header suitable for calling this site's own admin API routes
 * (e.g. POST /api/admin/blog) exactly as the /admin panel does.
 *
 * How it works — no admin password is stored anywhere:
 *  1. The service-role client mints a one-time magic link for the admin
 *     account (auth.admin.generateLink). No email is sent; the link's
 *     hashed_token is returned to the caller.
 *  2. An anon client verifies that token (auth.verifyOtp), which yields
 *     a genuine Supabase session for the admin user.
 *  3. The session is loaded into an @supabase/ssr server client backed
 *     by an in-memory cookie store, so the library itself serialises the
 *     session into the exact cookie format the site's server client
 *     (lib/supabase/server.ts) expects to read.
 *
 * The admin routes still run their own checks (session user + profiles
 * role = 'admin') on every call — this helper only provides the session,
 * it never bypasses the admin layer.
 *
 * Returns null when env is incomplete or any step fails; callers must
 * treat null as "cannot publish" and stop loudly.
 */
export async function getAdminCookieHeader(): Promise<{
  cookieHeader: string;
  email: string;
} | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return null;

  const email =
    process.env.BUFFER_ADMIN_EMAIL || "tauseefrock456@gmail.com";

  try {
    const service = createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: linkData, error: linkError } =
      await service.auth.admin.generateLink({ type: "magiclink", email });
    const hashedToken = linkData?.properties?.hashed_token;
    if (linkError || !hashedToken) return null;

    const anon = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: verified, error: verifyError } = await anon.auth.verifyOtp({
      token_hash: hashedToken,
      type: "magiclink",
    });
    const session = verified?.session;
    if (verifyError || !session) return null;

    const captured = new Map<string, string>();
    const ssr = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => captured.set(name, value));
        },
      },
    });
    const { error: setError } = await ssr.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (setError || captured.size === 0) return null;

    const cookieHeader = [...captured.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
    return { cookieHeader, email };
  } catch {
    return null;
  }
}
