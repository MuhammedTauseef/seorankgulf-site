"use client";

import { useEffect, useState } from "react";

const KEY = "seorankgulf-cookie-consent";

/** Simple cookie consent banner — required for AdSense/GDPR compliance. */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    // Tell Google Consent Mode about the choice.
    try {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        const granted = value === "accepted" ? "granted" : "denied";
        gtag("consent", "update", {
          ad_storage: granted,
          ad_user_data: granted,
          ad_personalization: granted,
          analytics_storage: granted,
        });
      }
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 480,
        margin: "0 auto",
        background: "#111827",
        color: "#f9fafb",
        borderRadius: 12,
        padding: "16px 20px",
        boxShadow: "0 8px 32px rgba(0,0,0,.35)",
        zIndex: 9999,
        fontSize: ".9rem",
      }}
    >
      <p style={{ margin: "0 0 12px" }}>
        We use cookies to improve your experience and analyze site traffic. By
        continuing, you agree to our{" "}
        <a href="/privacy" style={{ color: "#fbbf24", textDecoration: "underline" }}>
          Privacy Policy
        </a>
        .
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => choose("accepted")}
          style={{
            background: "#f59e0b",
            color: "#111827",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: ".9rem",
          }}
        >
          Accept
        </button>
        <button
          onClick={() => choose("rejected")}
          style={{
            background: "transparent",
            color: "#f9fafb",
            border: "1px solid #4b5563",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: ".9rem",
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
