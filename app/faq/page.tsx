import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ — AI Automation Questions Answered | ReplyPilot",
  description:
    "Common questions about AI sales agents, WhatsApp automation, Instagram DM automation, and workflow automation for small businesses — answered simply.",
  keywords: [
    "AI agent FAQ",
    "WhatsApp automation questions",
    "AI chatbot for business FAQ",
    "ReplyPilot FAQ",
  ],
  alternates: {
    canonical: "https://replypilot-site.vercel.app/faq",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/faq",
    images: [
      {
        url: "https://replypilot-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ReplyPilot — AI Sales Agents for Small Business",
      },
    ],
  }
};

const faqs = [
  {
    q: "What is an AI sales agent?",
    a: "An AI sales agent is a smart chatbot that talks to your customers on WhatsApp, Instagram, or your website. It answers questions, books appointments, and captures leads — even at 2 AM when you're asleep. Think of it as a super-helpful employee who never takes a day off.",
  },
  {
    q: "How does WhatsApp automation work?",
    a: "When a customer messages your business on WhatsApp, the AI reads the message and replies instantly — just like a real person would. It can share prices, book appointments, answer common questions, and send the details to you. You only step in when a human touch is needed.",
  },
  {
    q: "Do I need technical skills to use it?",
    a: "No. We build everything for you. You just tell us about your business — your services, prices, and common questions — and we set up the AI agent. Most businesses are live within 48 hours.",
  },
  {
    q: "Will customers know they're talking to AI?",
    a: "The AI talks naturally, like a friendly team member. But we're always honest — if a customer asks, the agent says it's an AI assistant. Most customers care about getting quick, helpful answers, not who's typing them.",
  },
  {
    q: "What happens if the AI can't answer something?",
    a: "The AI is trained on your business, so it handles most questions. For anything tricky, it politely hands the conversation to you with a summary — so you jump in already knowing the full context.",
  },
  {
    q: "Can it work on Instagram too?",
    a: "Yes. The same AI can handle Instagram DMs — replying to enquiries, booking appointments, and answering FAQs. Many businesses use it on WhatsApp, Instagram, and their website all at once.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing is shared after you create a free account and log in. We keep it simple: a one-time build fee and a monthly care plan that keeps your agent improving.",
  },
  {
    q: "How long does setup take?",
    a: "Most builds go live within 48 hours. We study your business, build the agent, test it with you, and then launch. You'll see a working demo before anything goes live.",
  },
  {
    q: "What if I want changes later?",
    a: "That's what the monthly care plan is for. As your business grows — new services, new prices, new questions — we update your agent so it always stays accurate.",
  },
  {
    q: "Is my customer data safe?",
    a: "Yes. Your data is stored securely and never sold or shared. You own your data — your customers, your conversations, your business information.",
  },
];

/** /faq — frequently asked questions with FAQ schema for SEO. */
export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">FAQ</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Questions? Answered simply.
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32 }}>
            Everything business owners ask us about AI agents — in plain
            language.
          </p>

          <div className="legal-body">
            {faqs.map((f, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: "1.25rem" }}>{f.q}</h2>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <p>
              Still curious? <Link href="/demo">Try a live demo</Link> or{" "}
              <Link href="/contact">contact us</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
