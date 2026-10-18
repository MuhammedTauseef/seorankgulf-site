"use client";

import { useEffect, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";

const BUSINESS_TYPES = [
  "Boutique / Retail",
  "Restaurant / Food",
  "Salon / Spa",
  "Real estate",
  "Fitness",
  "Health / Dental",
  "Home services",
  "Events",
  "Other",
];

type Status = { kind: "ok" | "err"; text: string } | null;

/**
 * Contact / lead-capture form. Submits to /api/leads (one tap, no email
 * app needed) and stores the enquiry in the database.
 *
 * On a successful submit it fires the GA4 `generate_lead` conversion
 * event (form_location identifies where the form lives).
 *
 * Listens for the "demo-select" window event (fired by demo cards) to
 * pre-fill the message and scroll the form into view.
 */
export default function ContactForm({
  formLocation = "homepage",
}: {
  formLocation?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const onDemo = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail) {
        setMessage(
          `Hi! I'm interested in the "${detail}" demo concept. Please show me how it would work for my business.`
        );
        setStatus(null);
      }
    };
    window.addEventListener("demo-select", onDemo);
    return () => window.removeEventListener("demo-select", onDemo);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus(null);

    // Honeypot value lives in a hidden input named "website".
    const form = e.currentTarget;
    const website = (form.elements.namedItem("website") as HTMLInputElement)
      ?.value;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, businessType, message, website }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        trackEvent("generate_lead", { form_location: formLocation });
        setStatus({
          kind: "ok",
          text: "Message received! Tauseef will reply within 24 hours.",
        });
        setName("");
        setEmail("");
        setBusinessType("");
        setMessage("");
      } else {
        setStatus({
          kind: "err",
          text: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setStatus({
        kind: "err",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate={false}>
      <h3>Request your free demo</h3>
      <p>
        Tell us about your business. We reply within 24 hours with a practical
        next step.
      </p>

      <div className="field">
        <label htmlFor="cf-name">Your name</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sarah Ahmed"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div className="field">
        <label htmlFor="cf-email">Email address</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@business.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={160}
        />
      </div>

      <div className="field">
        <label htmlFor="cf-type">Business type</label>
        <select
          id="cf-type"
          name="businessType"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          <option value="">Select (optional)</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="cf-message">What should we automate?</label>
        <textarea
          id="cf-message"
          name="message"
          placeholder="e.g. Customers message us on WhatsApp about prices and timings, and we reply late…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
        />
      </div>

      {/* Honeypot — hidden from humans, catches bots */}
      <input
        type="text"
        name="website"
        className="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button type="submit" className="btn btn-navy" disabled={sending}>
        {sending ? "Sending…" : "Send message"}
        <span className="arrow" aria-hidden="true"> →</span>
      </button>

      <div
        className={`form-status${status ? ` ${status.kind}` : ""}`}
        role="status"
        aria-live="polite"
      >
        {status?.text}
      </div>
    </form>
  );
}
