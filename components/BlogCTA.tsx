"use client";

import { useState, type FormEvent } from "react";
import TrackedLink from "@/components/TrackedLink";
import { trackEvent } from "@/lib/analytics";
import { whatsappLink } from "@/lib/site-config";

/** Contextual info derived per article: niche + automation channel. */
export interface CtaContext {
  /** e.g. "clothing boutiques" */
  niche: string;
  /** e.g. "WhatsApp automation" */
  channel: string;
}

function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="#ffffff"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4zm-3.2 4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-2-1c-.2-.1-.4-.1-.6.1l-.9 1.1c-.2.2-.3.2-.6.1a7.6 7.6 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.4 8.3c-.1-.2-.3-.3-.6-.3z" />
    </svg>
  );
}

/** Green inline WhatsApp click-to-chat button with a pre-filled message. */
export function WhatsAppButton({
  ctx,
  label,
}: {
  ctx: CtaContext;
  label?: string;
}) {
  const href = whatsappLink(
    `Hi! I read your article about ${ctx.channel} for ${ctx.niche} and want this for my business.`
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "#25D366",
        color: "#062b16",
        fontWeight: 800,
        fontSize: "1rem",
        padding: "14px 26px",
        borderRadius: 999,
        textDecoration: "none",
        lineHeight: 1.2,
      }}
    >
      <WhatsAppGlyph />
      {label ?? "Chat on WhatsApp"}
    </a>
  );
}

/** Floating WhatsApp button on article pages — stacked above the chat widget. */
export function WhatsAppFloat({ ctx }: { ctx: CtaContext }) {
  const href = whatsappLink(
    `Hi! I was reading your blog about ${ctx.channel} and have a question.`
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        right: 22,
        bottom: 96,
        zIndex: 150,
        width: 62,
        height: 62,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        textDecoration: "none",
      }}
    >
      <WhatsAppGlyph />
    </a>
  );
}

/**
 * Mid-article contextual CTA — inserted at ~40% of the article body,
 * BEFORE the reader's attention drops. Mentions the article's niche.
 */
export function MidArticleCTA({ ctx }: { ctx: CtaContext }) {
  // Avoid "your your business" when the niche is generic.
  const nichePossessive =
    ctx.niche === "your business" ? "your business" : `your ${ctx.niche}`;
  return (
    <div
      style={{
        background: "rgba(216, 189, 143, 0.08)",
        border: "1px solid rgba(216, 189, 143, 0.35)",
        borderLeft: "4px solid var(--gold-soft)",
        borderRadius: 12,
        padding: "26px 28px",
        margin: "36px 0",
      }}
    >
      <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: "1.15rem" }}>
        Want this for {nichePossessive}?
      </p>
      <p style={{ margin: "0 0 18px", color: "#b9c6e2", maxWidth: "60ch" }}>
        ReplyPilot builds a custom {ctx.channel.toLowerCase()} setup for{" "}
        {nichePossessive} — answering customer questions instantly, taking
        orders and bookings, and handing off to you when a human is needed.
      </p>
      <WhatsAppButton ctx={ctx} label="Ask on WhatsApp — it's free" />
    </div>
  );
}

/**
 * End-of-article CTA — replaces the old generic box. Two clear options:
 * WhatsApp chat (instant) + free demo request (formal).
 */
export function EndOfArticleCTA({ ctx }: { ctx: CtaContext }) {
  const nichePossessive =
    ctx.niche === "your business" ? "your business" : `your ${ctx.niche}`;
  return (
    <div className="article-cta">
      <div>
        <h3>Want this working in {nichePossessive}?</h3>
        <p>
          ReplyPilot builds custom {ctx.channel.toLowerCase()} around your
          services, your FAQs, and your booking flow — with a free custom
          demo before you decide.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <WhatsAppButton ctx={ctx} label="Chat on WhatsApp" />
        <TrackedLink
          href="/#contact"
          variant="link"
          className="btn btn-gold"
          eventName="demo_request"
          eventParams={{ cta_location: "blog", cta_text: "Get a free demo" }}
        >
          Get a free demo
        </TrackedLink>
      </div>
    </div>
  );
}

/**
 * Lead magnet: free checklist email capture. Submits to the existing
 * /api/leads endpoint (rate-limited, honeypot-protected, stored in the
 * `leads` table). No automated email delivery yet — see backend gap note.
 */
export function LeadMagnetForm({ ctx }: { ctx: CtaContext }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus(null);

    const form = e.currentTarget;
    const website = (form.elements.namedItem("website") as HTMLInputElement)
      ?.value;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          businessType: ctx.niche,
          message: `Lead magnet request: Free ${ctx.channel} Checklist for ${ctx.niche}`,
          website,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        trackEvent("generate_lead", { form_location: "blog" });
        setStatus({
          ok: true,
          text: "You're on the list! Tauseef will send your free checklist within 24 hours.",
        });
        setName("");
        setEmail("");
      } else {
        setStatus({
          ok: false,
          text: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setStatus({
        ok: false,
        text: "Network hiccup — please try again in a moment.",
      });
    } finally {
      setSending(false);
    }
  }

  const title = `Free ${ctx.channel} Checklist for ${ctx.niche}`;

  return (
    <div
      style={{
        marginTop: 52,
        background: "linear-gradient(140deg, var(--navy), var(--navy-3))",
        borderRadius: 20,
        padding: "44px 40px",
        color: "#fff",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: ".8rem",
          fontWeight: 800,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--gold-soft)",
        }}
      >
        Free download
      </p>
      <h3 style={{ margin: "0 0 10px", fontSize: "1.5rem" }}>{title}</h3>
      <p style={{ margin: "0 0 22px", color: "#b9c6e2", maxWidth: "56ch" }}>
        The exact setup checklist we use for {ctx.niche} — what to automate
        first, which messages to prepare, and the mistakes that kill
        conversions. Free, no spam.
      </p>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          required
          maxLength={120}
          style={{
            flex: "1 1 180px",
            minHeight: 54,
            padding: "0 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.08)",
            color: "#fff",
            fontSize: "1rem",
          }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Your email"
          required
          maxLength={160}
          style={{
            flex: "1 1 220px",
            minHeight: 54,
            padding: "0 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.08)",
            color: "#fff",
            fontSize: "1rem",
          }}
        />
        {/* honeypot — real users never fill this */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: -9999, opacity: 0, height: 0 }}
        />
        <button
          type="submit"
          disabled={sending}
          className="btn btn-gold"
          style={{ flex: "0 0 auto" }}
        >
          {sending ? "Sending…" : "Send me the checklist"}
        </button>
      </form>
      {status && (
        <p
          role="status"
          style={{
            margin: "16px 0 0",
            color: status.ok ? "#7ee2a8" : "#ff9d9d",
            fontWeight: 600,
          }}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
