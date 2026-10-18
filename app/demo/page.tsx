import type { Metadata } from "next";
import DemoPlayground from "@/components/DemoPlayground";
import PriceValue from "@/components/PriceValue";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Live AI Demo — Try ReplyPilot in Action",
  description:
    "Try a live ReplyPilot AI agent right now. Pick from 13 demo businesses — salon, restaurant, real estate, dental clinic and more — and chat with their AI assistant.",
  alternates: { canonical: "https://replypilot-site.vercel.app/demo" },
  openGraph: {
    title: "Live AI Demo — Try ReplyPilot in Action",
    description:
      "Chat live with AI assistants for 13 demo businesses. See what ReplyPilot can do for yours.",
    url: "https://replypilot-site.vercel.app/demo",
    type: "website",
    images: [
      {
        url: "https://replypilot-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ReplyPilot — AI Sales Agents for Small Business",
      },
    ],
  },
};

/**
 * /demo — full-page live AI demo with all 13 demo businesses.
 * Pick a business → the agent roleplays as that business's assistant.
 * Powered by /api/chat (keys stay server-side).
 */
export default function DemoPage() {
  return (
    <main>
      <section className="hero" style={{ padding: 0 }}>
        <div
          className="wrap hero-inner"
          style={{ paddingTop: 64, paddingBottom: 48 }}
        >
          <span className="eyebrow">Live demo</span>
          <h1
            className="hero-statement"
            style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
          >
            Try the AI agent<span className="dot">.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: "36ch" }}>
            Pick any of the 13 demo businesses and chat with its AI assistant —
            the same kind of agent we build for real businesses.
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <DemoPlayground />

          <div
            style={{
              marginTop: 36,
              background: "#0a172a",
              color: "#fff",
              borderRadius: 18,
              padding: "clamp(28px,4vw,44px)",
              display: "grid",
              gap: 18,
              alignItems: "center",
            }}
          >
            <h2
              style={{ margin: 0, fontSize: "1.7rem", letterSpacing: "-.02em" }}
            >
              Like what you see? Get one for your business<PriceValue> — $249</PriceValue>.
            </h2>
            <p style={{ margin: 0, color: "#b9c6e2" }}>
              Trained on your products, your prices, your FAQs. Live in 48
              hours, with a free custom demo first.
            </p>
            <div>
              <TrackedLink
                href="/#contact"
                variant="link"
                className="btn btn-gold"
                eventName="demo_request"
                eventParams={{
                  cta_location: "demo-page",
                  cta_text: "Get Your AI Agent",
                }}
              >
                Get Your AI Agent<PriceValue> — $249</PriceValue>{" "}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
