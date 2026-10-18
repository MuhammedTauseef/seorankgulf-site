"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hides prices from logged-out visitors (lead capture).
 * Signed-in users see the price; everyone else sees a login nudge.
 */
export default function PriceValue({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!loggedIn) {
    return (
      <a
        href="/login"
        title="Log in to see pricing"
        aria-label="Log in to see pricing"
        style={{ textDecoration: "none", whiteSpace: "nowrap" }}
      >
        <span aria-hidden="true">🔒</span>{" "}
        <span style={{ fontSize: ".78em", fontWeight: 700 }}>Log in</span>
      </a>
    );
  }
  return <>{children}</>;
}
