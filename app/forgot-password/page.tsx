"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/** /forgot-password — request a secure password-reset email. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const supabase = createClient();
    // Always show success — never reveal whether the email is registered.
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setBusy(false);
    setDone(true);
  }

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Reset password</h1>
        {done ? (
          <p style={{ color: "#4b5563" }}>
            If an account exists for <strong>{email.trim()}</strong>, a reset
            link is on its way. Check your inbox (and spam folder).
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <p style={{ color: "#4b5563", fontSize: ".94rem" }}>
              Enter your account email and we&apos;ll send you a secure reset link.
            </p>
            <div className="field">
              <label htmlFor="fp-email">Email</label>
              <input
                id="fp-email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160}
              />
            </div>
            <button type="submit" className="btn btn-navy" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <div className={`form-status${error ? " err" : ""}`} role="alert">
              {error}
            </div>
            <p style={{ marginTop: 18, fontSize: ".92rem", color: "#4b5563" }}>
              <Link href="/login">Back to log in</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
