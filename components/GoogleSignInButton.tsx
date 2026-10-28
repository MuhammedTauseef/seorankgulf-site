"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchGoogleProviderStatus } from "@/lib/google-provider";

/**
 * "Continue with Google" button + "or" divider, shared by /login and
 * /signup. Starts the Google OAuth flow via the existing Supabase
 * browser client and returns through /auth/callback, which forwards to
 * /login (already signed-in visitors are then routed by the proxy to
 * /admin or /dashboard by role — the same landing as the email flow).
 *
 * Provider status: the button is live, but Google sign-in only works
 * once the Google provider is enabled in the Supabase dashboard
 * (Authentication → Providers → Google — an owner step). Before
 * navigating, the click pre-checks the provider via Supabase's public
 * settings endpoint (lib/google-provider): signInWithOAuth navigates
 * straight to the authorize URL, which — while the provider is
 * disabled — answers with a raw JSON error page instead of
 * redirecting back. So:
 *  - provider explicitly disabled → no navigation; the friendly
 *    GOOGLE_NOT_AVAILABLE_MESSAGE is shown in place via onError;
 *  - provider enabled → OAuth proceeds exactly as before;
 *  - pre-check inconclusive (network error, non-200, odd payload) →
 *    OAuth is attempted anyway — a failed pre-check never blocks a
 *    possibly-working login.
 * Independently, if an OAuth attempt still bounces back, /login shows
 * its own message via the ?error=auth handling there. The raw provider
 * error is never displayed.
 */
export const GOOGLE_NOT_AVAILABLE_MESSAGE =
  "Google sign-in is not available yet — please use email for now.";

export default function GoogleSignInButton({
  onError,
}: {
  onError: (message: string | null) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "checking" | "redirecting">(
    "idle"
  );
  const busy = phase !== "idle";

  async function continueWithGoogle() {
    if (busy) return;
    setPhase("checking");
    onError(null);
    try {
      // Pre-check: never navigate into the raw JSON error page that
      // the authorize URL serves while the provider is disabled.
      const status = await fetchGoogleProviderStatus(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      if (status === "disabled") {
        setPhase("idle");
        onError(GOOGLE_NOT_AVAILABLE_MESSAGE);
        return;
      }
      setPhase("redirecting");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/login`,
        },
      });
      if (error) {
        setPhase("idle");
        onError(GOOGLE_NOT_AVAILABLE_MESSAGE);
      }
      // On success the browser is navigating away to Google — keep the
      // button in its busy state.
    } catch {
      setPhase("idle");
      onError(GOOGLE_NOT_AVAILABLE_MESSAGE);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={busy}
        title="Continue with Google"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          border: "1px solid #dadce0",
          background: "#fff",
          color: "#3c4043",
          fontSize: ".95rem",
          fontWeight: 600,
          cursor: busy ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 16,
          opacity: busy ? 0.75 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        {phase === "checking"
          ? "Checking Google sign-in…"
          : phase === "redirecting"
            ? "Redirecting to Google…"
            : "Continue with Google"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        <span style={{ fontSize: ".85rem", color: "#6b7280" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      </div>
    </>
  );
}
