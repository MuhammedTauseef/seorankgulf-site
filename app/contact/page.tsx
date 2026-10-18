import type { Metadata } from "next";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Contact — SEORankGulf",
  description:
    "Contact SEORankGulf — email us about SEO services for your business for your business.",
  alternates: {
    canonical: "https://seorankgulf.com/contact",
  },
  openGraph: {
    url: "https://seorankgulf.com/contact",
    images: [
      {
        url: "https://seorankgulf.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SEORankGulf — AI Sales Agents for Small Business",
      },
    ],
  }
};

const fallbackBlocks: Block[] = [
  { type: "h2", text: "Email" },
  { type: "p", text: "muhammadtauseef714@gmail.com" },
  { type: "h2", text: "What to include" },
  { type: "p", text: "Tell us a little about your business and what you'd like to automate." },
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
            The fastest way to reach us is email. We reply within one business
            day.
          </p>

          <div className="legal-body">
            {blocks.map(renderBlock)}
          </div>
        </div>
      </section>
    </main>
  );
}
