import type { Metadata } from "next";
import { getStaticPage } from "@/lib/pages";
import { CONTACT_EMAIL, emailLink } from "@/lib/site-config";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Contact — SEORankGulf",
  description:
    "Contact SEORankGulf — email or WhatsApp us about SEO services for your Gulf business. Free SEO audit available.",
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/contact",
  },
  openGraph: {
    url: "https://seorankgulf-site.vercel.app/contact",
    images: [
      {
        url: "https://seorankgulf-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SEORankGulf — SEO Services for Gulf Businesses",
      },
    ],
  }
};

const fallbackBlocks: Block[] = [
  { type: "h2", text: "Email" },
  { type: "p", text: CONTACT_EMAIL },
  { type: "h2", text: "WhatsApp" },
  { type: "p", text: "+92 315 0642491 — the fastest way to reach us. Message us for a free SEO audit of your business." },
  { type: "h2", text: "What to include" },
  { type: "p", text: "Tell us a little about your business, your website URL, and what you'd like to rank for on Google." },
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
    default: {
      const text = (block as { text: string }).text;
      // The standalone email paragraph renders as a tappable mailto link.
      if (text.trim() === CONTACT_EMAIL) {
        return (
          <p key={i}>
            <a href={emailLink()}>{CONTACT_EMAIL}</a>
          </p>
        );
      }
      return <p key={i}>{text}</p>;
    }
  }
}

/** /contact — simple contact page. Content editable via admin. */
export default async function ContactPage() {
  const page = await getStaticPage("contact");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Contact</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Let&apos;s talk about your business.
          </h1>
          <p style={{ color: "#4b5563" }}>
            The fastest way to reach us is WhatsApp at{" "}
            <a
              href="https://wa.me/923150642491?text=Hi!%20I%20want%20a%20free%20SEO%20audit%20for%20my%20business."
              target="_blank"
              rel="noopener"
            >
              +92 315 0642491
            </a>
            . We reply within one business day.
          </p>

          <div className="legal-body">
            {blocks.map(renderBlock)}
          </div>
        </div>
      </section>
    </main>
  );
}
