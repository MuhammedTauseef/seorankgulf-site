"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Header auth area. Signed out → "Log in".
 * Signed in → "Dashboard" (clients) or "Admin" (admins) + "Sign out".
 */
export default function AuthNav() {
  // undefined = still checking, null = signed out, string = role
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setRole(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      setRole((profile as { role?: string } | null)?.role ?? "client");
    }

    // Subscribe first so we never miss the session event that fires
    // right after an OAuth redirect (the initial getUser() can race
    // the cookie write and return null even though a session exists).
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        check();
      } else if (event === "SIGNED_OUT") {
        setRole(null);
      }
    });

    // Initial check, with one retry for the OAuth-redirect race:
    // if the first check finds no user, re-check once after a beat
    // in case the session was still being established.
    check();
    const retryTimer = setTimeout(() => {
      if (cancelled) return;
      // Only re-check if we still think the user is logged out —
      // avoids a stale "Log in" after a fresh OAuth sign-in.
      setRole((prev) => {
        if (prev === null) check();
        return prev;
      });
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      const supabase = createClient();
      // Never hang on a slow network — 5s max, then move on.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      // ignore — navigate home anyway
    }
    window.location.href = "/";
  }

  // Still checking: render nothing (not "Log in") to avoid a
  // logged-out flash for users who are actually signed in.
  if (role === undefined) {
    return null;
  }

  if (role === null) {
    return (
      <a className="nav-link" href="/login">
        Log in
      </a>
    );
  }

  const dest = role === "admin" ? "/admin" : "/dashboard";
  const label = role === "admin" ? "Admin" : "Dashboard";

  return (
    <>
      <a className="nav-link" href={dest}>
        {label}
      </a>
      <button type="button" className="nav-link nav-signout" onClick={signOut}>
        Sign out
      </button>
    </>
  );
}
