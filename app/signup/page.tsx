"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/PasswordField";
import GoogleSignInButton from "@/components/GoogleSignInButton";
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

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Create your account</h1>
        <p>Sign up to track your enquiries and manage your AI agent.</p>

        <GoogleSignInButton onError={setError} />

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
