"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PasswordField from "@/components/PasswordField";
import GoogleSignInButton from "@/components/GoogleSignInButton";
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

  // Arriving back from a failed auth redirect: /auth/callback forwards
  // here with ?error=auth when a sign-in can't be completed — most
  // commonly a Google attempt made before the Google provider is
  // enabled in the Supabase dashboard. Show a plain, honest message
  // instead of a silent empty form, then strip the flag from the URL.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        setError(
          "Sign-in didn't complete. Google sign-in is not available yet — please use email and password for now."
        );
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Log in</h1>
        <p>Welcome back.</p>
        <GoogleSignInButton onError={setError} />
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
