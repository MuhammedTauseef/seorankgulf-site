"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/PasswordField";

/**
 * /admin/login — sign in with the admin email + password
 * (created in the Supabase dashboard under Authentication → Users).
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Invalid email or password.");
      setBusy(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-wrap">
      <div className="admin-card">
        <h1>Admin sign in</h1>
        <p>Sign in to view website enquiries.</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="al-email">Email</label>
            <input
              id="al-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <PasswordField
            id="al-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
          <button
            type="submit"
            className="btn btn-navy"
            style={{ width: "100%" }}
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div
            className={`form-status${error ? " err" : ""}`}
            role="status"
            aria-live="polite"
          >
            {error}
          </div>
        </form>
      </div>
    </main>
  );
}
