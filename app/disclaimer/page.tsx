import type { Metadata } from "next";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Disclaimer | SEORankGulf",
  description:
    "SEORankGulf disclaimer — educational content, no guarantees, affiliate and advertising disclosure.",
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/disclaimer",
  },
  openGraph: {
    url: "https://seorankgulf-site.vercel.app/disclaimer",
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
  { type: "p", text: "Last updated: October 8, 2026" },
  { type: "h2", text: "General information" },
  { type: "p", text: "The content on SEORankGulf is provided for general information and educational purposes only." },
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

/** /disclaimer — AdSense + trust requirement. Content editable via admin. */
export default async function DisclaimerPage() {
  const page = await getStaticPage("disclaimer");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;

  return (
    <main>
      <section className="block">
        <div className="wrap legal-body" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Legal</span>
          <h1 className="display">Disclaimer</h1>
          {blocks.map(renderBlock)}
        </div>
      </section>
    </main>
  );
}
