import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Terms of Service — ReplyPilot",
  description:
    "The terms for using the ReplyPilot website and engaging ReplyPilot's AI automation services.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/terms",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/terms",
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

const fallbackBlocks: Block[] = [
  { type: "p", text: "Last updated: October 14, 2026" },
  { type: "h2", text: "Using this website" },
  { type: "p", text: "By using this site you agree to these terms. ReplyPilot is an AI automation studio operated by Muhammad Tauseef. If you do not agree, please do not use the site." },
  { type: "h2", text: "The AI assistant" },
  { type: "p", text: "The on-site chat assistant answers questions about ReplyPilot's services. It can save your contact details as a lead or book a demo slot if you ask it to. It does not give legal, financial, or medical advice, and while it tries to be accurate, you should confirm important details by email at muhammadtauseef714@gmail.com." },
  { type: "h2", text: "Demos" },
  { type: "p", text: "The demo businesses and demo conversations shown on this site are fictional samples that show what ReplyPilot can build. They are not real clients, real results, or performance claims." },
  { type: "h2", text: "Services and pricing" },
  { type: "ul", items: [
      "Setup: $249 one-time per AI agent, with 50% ($125) due upfront and 50% ($124) on go-live.",
      "Ongoing care: $99/month for hosting, updates, and support, cancellable anytime.",
      "Delivery: first build targeted within 48 hours of the upfront payment; you approve before go-live.",
      "Risk reversal: the second 50% is only due once the agent is live and working as agreed."
    ] },
  { type: "p", text: "Exact scope, timelines, and any third-party costs (for example WhatsApp or platform fees, paid directly by the client to those providers) are confirmed in writing before work starts. Your agent may also use third-party services that bill you directly, such as AI model API usage and WhatsApp Business API conversation charges; those are explained before you commit." },
  { type: "h2", text: "Demo bookings" },
  { type: "p", text: "Demo calls booked through the site are 30 minutes. A booking is stored as pending until confirmed. If a slot is taken before your booking is saved, you will be offered another time." },
  { type: "h2", text: "Acceptable use" },
  { type: "ul", items: [
      "Do not abuse the contact form, chat, or booking tools.",
      "Do not attempt to break, overload, or bypass this site's security.",
      "Do not use the demos or content here to misrepresent ReplyPilot's work as your own."
    ] },
  { type: "h2", text: "Intellectual property" },
  { type: "p", text: "The content on this site, including text, images, videos, and demos, belongs to ReplyPilot. You may read and share links to it, but you may not copy, republish, or claim it as your own without permission." },
  { type: "h2", text: "Liability" },
  { type: "p", text: "This site and its demos are provided as is. To the extent allowed by law, ReplyPilot is not liable for indirect or consequential losses from using the site. Nothing here limits rights you have under applicable consumer law." },
  { type: "h2", text: "Changes" },
  { type: "p", text: "These terms may be updated occasionally; the date at the top shows the latest version. Continued use of the site after changes means you accept them." },
  { type: "h2", text: "Contact" },
  { type: "p", text: "Questions about these terms: email muhammadtauseef714@gmail.com." },
];

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i}>{block.text}</h2>;
    case "ul":
      return (
        <ul key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "img":
      return null; // images not used on static pages
    default:
      return <p key={i}>{(block as { text: string }).text}</p>;
  }
}

/** /terms — plain-language terms of service. Content editable via admin. */
export default async function TermsPage() {
  const page = await getStaticPage("terms");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Terms of Service</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Fair terms, in plain language.
          </h1>

          <div className="legal-body">
            {blocks.map(renderBlock)}
            <p>
              <Link href="/">← Back to home</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
