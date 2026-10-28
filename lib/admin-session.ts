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
 * mintAdminSession reports WHICH step failed (config / generate_link /
 * verify_otp / set_session) with the underlying auth error message, so
 * a failed cron run logs a diagnosis instead of a bare null. Token
 * material is never included in the failure text.
 */

export type AdminSessionResult =
  | { ok: true; cookieHeader: string; email: string }
  | {
      ok: false;
      step: "config" | "generate_link" | "verify_otp" | "set_session";
      error: string;
    };

function errText(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.slice(0, 300);
}

export async function mintAdminSession(): Promise<AdminSessionResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return {
      ok: false,
      step: "config",
      error:
        "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const email = process.env.BUFFER_ADMIN_EMAIL || "tauseefrock456@gmail.com";

  const service = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let hashedToken: string | undefined;
  try {
    const { data: linkData, error: linkError } =
      await service.auth.admin.generateLink({ type: "magiclink", email });
    if (linkError) {
      return { ok: false, step: "generate_link", error: errText(linkError) };
    }
    hashedToken = linkData?.properties?.hashed_token;
    if (!hashedToken) {
      return {
        ok: false,
        step: "generate_link",
        error: "generateLink returned no hashed_token.",
      };
    }
  } catch (err) {
    return { ok: false, step: "generate_link", error: errText(err) };
  }

  const anon = createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let session: { access_token: string; refresh_token: string } | null = null;
  try {
    const { data: verified, error: verifyError } = await anon.auth.verifyOtp({
      token_hash: hashedToken,
      type: "magiclink",
    });
    if (verifyError) {
      return { ok: false, step: "verify_otp", error: errText(verifyError) };
    }
    session = verified?.session ?? null;
    if (!session) {
      return {
        ok: false,
        step: "verify_otp",
        error: "verifyOtp returned no session.",
      };
    }
  } catch (err) {
    return { ok: false, step: "verify_otp", error: errText(err) };
  }

  try {
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
    if (setError) {
      return { ok: false, step: "set_session", error: errText(setError) };
    }
    if (captured.size === 0) {
      return {
        ok: false,
        step: "set_session",
        error: "setSession produced no session cookies.",
      };
    }
    const cookieHeader = [...captured.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
    return { ok: true, cookieHeader, email };
  } catch (err) {
    return { ok: false, step: "set_session", error: errText(err) };
  }
}

/**
 * Backwards-compatible wrapper: the session as a cookie header, or
 * null when minting failed. New callers should use mintAdminSession
 * so failures carry their step + cause.
 */
export async function getAdminCookieHeader(): Promise<{
  cookieHeader: string;
  email: string;
} | null> {
  const result = await mintAdminSession();
  if (!result.ok) return null;
  return { cookieHeader: result.cookieHeader, email: result.email };
}
