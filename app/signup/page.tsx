"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/PasswordField";
import { trackEvent } from "@/lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordIssues(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw))
    return "Password must include both letters and numbers.";
  return null;
}

/** /signup — create a client account (email verification via Supabase). */
export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return setError("Please enter your full name.");
    if (!EMAIL_RE.test(cleanEmail)) return setError("Enter a valid email address.");
    const pwIssue = passwordIssues(password);
    if (pwIssue) return setError(pwIssue);
    if (password !== confirm) return setError("Passwords do not match.");

    setBusy(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("This email is already registered. Try logging in instead.");
      } else {
        setError("Could not create your account. Please try again.");
      }
      return;
    }
    // Email signup succeeded (verification email sent) — GA4 sign_up.
    // Note: Google OAuth sign-ups redirect away and are not tracked here.
    trackEvent("sign_up", { method: "email" });
    setDone(true);
  }

  /**
   * Google OAuth is configured: Supabase Auth → Google provider is ENABLED
   * with a valid Client ID/Secret, callback URL registered, and the user
   * added as a test user (app is in Testing publishing status).
   * To disable: set GOOGLE_OAUTH_ENABLED = false.
   */
  const GOOGLE_OAUTH_ENABLED = true;

  async function signUpWithGoogle() {
    if (!GOOGLE_OAUTH_ENABLED) {
      setError("Google sign-up isn't available yet — please use email and password.");
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
      setError("Google sign-up failed. Please try again.");
    }
  }

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Create your account</h1>
        <p>Sign up to track your enquiries and manage your AI agent.</p>

        <button
          type="button"
          onClick={signUpWithGoogle}
          disabled={!GOOGLE_OAUTH_ENABLED}
          title={GOOGLE_OAUTH_ENABLED ? "Sign up with Google" : "Google sign-up coming soon"}
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

        {done ? (
          <div role="status">
            <p style={{ fontWeight: 700, color: "#1c7a3d" }}>
              Check your email ✉
            </p>
            <p style={{ color: "#4b5563" }}>
              We sent a verification link to <strong>{email.trim()}</strong>.
              Click it to activate your account, then log in.
            </p>
            <Link href="/login" className="btn btn-navy" style={{ width: "100%", marginTop: 12 }}>
              Go to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="su-name">Full name</label>
              <input
                id="su-name" type="text" autoComplete="name" required
                value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
                placeholder="e.g. Sarah Ahmed"
              />
            </div>
            <div className="field">
              <label htmlFor="su-email">Email</label>
              <input
                id="su-email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160}
                placeholder="you@business.com"
              />
            </div>
            <PasswordField
              id="su-password" label="Password" autoComplete="new-password"
              value={password} onChange={setPassword}
            />
            <PasswordField
              id="su-confirm" label="Confirm password" autoComplete="new-password"
              value={confirm} onChange={setConfirm}
            />
            <button type="submit" className="btn btn-navy" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Creating account…" : "Sign up"}
            </button>
            <div className={`form-status${error ? " err" : ""}`} role="status" aria-live="polite">
              {error}
            </div>
            <p className="auth-alt">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
