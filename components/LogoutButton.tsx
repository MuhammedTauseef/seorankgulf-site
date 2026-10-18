"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Admin sign-out button (Client Component). */
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      // Never hang forever on a slow network — 5s max, then move on.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      // Even if sign-out fails, navigate away; the proxy re-checks the session.
    }
    // Full reload so the session state is re-evaluated cleanly.
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      className="btn btn-navy"
      style={{ minHeight: 44, padding: "0 20px", fontSize: ".9rem" }}
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
