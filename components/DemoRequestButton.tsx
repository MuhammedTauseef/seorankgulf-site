"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * "Request this demo" button on demo cards.
 * One tap: fires a GA4 demo_request event, smooth-scrolls to the contact
 * form and pre-fills it with the demo name — no email app needed, works
 * on any phone.
 */
export default function DemoRequestButton({ demoName }: { demoName: string }) {
  function onClick() {
    trackEvent("demo_request", {
      cta_location: "demo-card",
      cta_text: "Request this demo",
      demo_name: demoName,
    });
    window.dispatchEvent(new CustomEvent("demo-select", { detail: demoName }));
    document
      .getElementById("contact")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button type="button" className="req" onClick={onClick}>
      Request this demo <span className="arrow" aria-hidden="true">→</span>
    </button>
  );
}
