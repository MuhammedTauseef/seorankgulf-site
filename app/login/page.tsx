"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import PasswordField from "@/components/PasswordField";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** /login — sign in, then route to /admin (admins) or /dashboard (clients). */
const MAX_ATTEMPTS = 5;
const LOCKOUT_KEY = "rp_login_lockout";

function getLockoutUntil(): number {
  try {
    return parseInt(localStorage.getItem(LOCKOUT_KEY) || "0", 10) || 0;
  } catch { return 0; }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);
  const [attempts, setAttempts] = useState(0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    // Client-side brute-force throttle: 5 failures → 60s lockout.
    // (Supabase also rate-limits auth endpoints server-side.)
    const lockoutUntil = getLockoutUntil();
    if (Date.now() < lockoutUntil) {
      const secs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${secs} seconds.`);
      return;
    }

    setBusy(true);
    setError(null);
    setNeedsVerify(false);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setBusy(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        try {
          localStorage.setItem(LOCKOUT_KEY, String(Date.now() + 60_000));
        } catch { /* storage unavailable */ }
        setAttempts(0);
        setError("Too many failed attempts. Locked for 60 seconds.");
        return;
      }
      const msg = signInError.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setNeedsVerify(true);
        setError("Please verify your email first — check your inbox for the link.");
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(`Invalid email or password. (${remaining} ${remaining === 1 ? "try" : "tries"} left)`);
      }
      return;
    }

    // Success: clear lockout state.
    setAttempts(0);
    try { localStorage.removeItem(LOCKOUT_KEY); } catch { /* ignore */ }

    // Role-aware landing: admins → /admin, clients → /dashboard.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let dest = "/dashboard";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if ((profile as { role?: string } | null)?.role === "admin") dest = "/admin";
    }
    router.push(dest);
    router.refresh();
  }

  async function resendVerification() {
    setResent(false);
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    setResent(true);
  }

  /**
   * Google OAuth is configured: Supabase Auth → Google provider is ENABLED
   * with a valid Client ID/Secret, callback URL registered, and the user
   * added as a test user (app is in Testing publishing status).
   * To disable: set GOOGLE_OAUTH_ENABLED = false.
   */
  const GOOGLE_OAUTH_ENABLED = true;

  async function signInWithGoogle() {
    if (!GOOGLE_OAUTH_ENABLED) {
      setError("Google sign-in isn't available yet — please use email and password.");
      return;
    }
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError("Google sign-in failed. Please try again.");
    }
  }

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Log in</h1>
        <p>Welcome back.</p>
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={!GOOGLE_OAUTH_ENABLED}
          title={GOOGLE_OAUTH_ENABLED ? "Sign in with Google" : "Google sign-in coming soon"}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "1px solid #dadce0",
            background: GOOGLE_OAUTH_ENABLED ? "#fff" : "#f3f4f6",
            color: GOOGLE_OAUTH_ENABLED ? "#3c4043" : "#9ca3af",
            fontSize: ".95rem",
            fontWeight: 600,
            cursor: GOOGLE_OAUTH_ENABLED ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 16,
            opacity: GOOGLE_OAUTH_ENABLED ? 1 : 0.75,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
          {!GOOGLE_OAUTH_ENABLED && (
            <span style={{ fontSize: ".75rem", fontWeight: 400 }}>(coming soon)</span>
          )}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: ".85rem", color: "#6b7280" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input
              id="li-email" type="email" autoComplete="username" required
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160}
            />
          </div>
          <PasswordField
            id="li-password" label="Password" autoComplete="current-password"
            value={password} onChange={setPassword}
          />
          <button type="submit" className="btn btn-navy" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
          <div className={`form-status${error ? " err" : ""}`} role="status" aria-live="polite">
            {error}
          </div>
          {needsVerify && (
            <p style={{ fontSize: ".92rem" }}>
              Didn&apos;t get the email?{" "}
              <button
                type="button"
                onClick={resendVerification}
                style={{ background: "none", border: 0, padding: 0, color: "#0a172a", fontWeight: 700, cursor: "pointer", font: "inherit", fontSize: ".92rem" }}
              >
                Resend verification email
              </button>
              {resent && <span style={{ color: "#1c7a3d" }}> — sent!</span>}
            </p>
          )}
          <p className="auth-alt">
            <Link href="/forgot-password">Forgot password?</Link>
            <br />
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
