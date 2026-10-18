"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { WHOP_CHECKOUT, hasCheckout, type CheckoutKey } from "@/lib/checkout";

/**
 * Login-gated Whop checkout CTA.
 * Mirrors PriceValue.tsx: prices are gated behind login for lead capture,
 * so the payment button only appears for signed-in users; everyone else
 * sees the same 🔒 login nudge. Renders nothing until the checkout link
 * is filled in (see lib/checkout.ts).
 *
 * `analytics` (optional): GA4 event fired when the signed-in checkout
 * link is clicked. Omitted on dashboard usages so internal billing
 * clicks don't pollute marketing CTA stats.
 */
export default function CheckoutButton({
  linkKey,
  label,
  className = "btn btn-gold",
  style,
  note,
  analytics,
}: {
  linkKey: CheckoutKey;
  label: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  note?: ReactNode;
  analytics?: { eventName: string; eventParams: Record<string, string> };
}) {
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

  if (!hasCheckout(linkKey)) return null;

  if (!loggedIn) {
    return (
      <a
        href="/login"
        title="Log in to pay"
        aria-label="Log in to pay"
        style={{ textDecoration: "none", whiteSpace: "nowrap" }}
      >
        <span aria-hidden="true">🔒</span>{" "}
        <span style={{ fontSize: ".78em", fontWeight: 700 }}>Log in</span>
      </a>
    );
  }

  return (
    <span style={{ display: "block" }}>
      <a
        className={className}
        style={{ width: "100%", ...style }}
        href={WHOP_CHECKOUT[linkKey]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (analytics) trackEvent(analytics.eventName, analytics.eventParams);
        }}
      >
        {label}{" "}
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </a>
      {note ? (
        <span
          className="fine"
          style={{ display: "block", marginTop: 8, fontSize: ".82em" }}
        >
          {note}
        </span>
      ) : null}
    </span>
  );
}
