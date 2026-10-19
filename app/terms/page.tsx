import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "Terms of Service — SEORankGulf",
  description:
    "The terms for using the SEORankGulf website and engaging SEORankGulf's SEO services.",
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/terms",
  },
  openGraph: {
    url: "https://seorankgulf-site.vercel.app/terms",
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
  { type: "p", text: "Last updated: October 19, 2026" },
  { type: "h2", text: "Using this website" },
  { type: "p", text: "By using this site you agree to these terms. SEORankGulf is an SEO agency operated by Muhammad Tauseef, providing search engine optimization services for Gulf-region businesses. If you do not agree, please do not use the site." },
  { type: "h2", text: "Services and pricing" },
  { type: "p", text: "SEORankGulf offers monthly SEO service plans. Current plans are: Starter at $300/month, Growth at $600/month, and Enterprise at $1,200/month. A free SEO audit is offered before any paid engagement so you can judge the quality of our work first." },
  { type: "ul", items: [
      "Plans are billed monthly and are month-to-month — you can cancel any time.",
      "Exact scope and deliverables for your business are confirmed in writing before work starts.",
      "We do not guarantee specific Google rankings. No honest SEO company can. We commit to proven methodology: technical fixes, quality content, and consistent execution.",
      "You keep full ownership of your Google Business Profile, website, domain, and analytics accounts at all times."
    ] },
  { type: "h2", text: "Free SEO audit" },
  { type: "p", text: "The free SEO audit is a no-obligation checkup of your website and Google presence with honest recommendations. Requesting an audit does not commit you to any paid plan." },
  { type: "h2", text: "Acceptable use" },
  { type: "ul", items: [
      "Do not abuse the contact form or other tools on this site.",
      "Do not attempt to break, overload, or bypass this site's security.",
      "Do not copy, republish, or claim SEORankGulf's content as your own without permission."
    ] },
  { type: "h2", text: "Intellectual property" },
  { type: "p", text: "The content on this site, including text, images, and videos, belongs to SEORankGulf. You may read and share links to it, but you may not copy, republish, or claim it as your own without permission." },
  { type: "h2", text: "Liability" },
  { type: "p", text: "This site is provided as is. To the extent allowed by law, SEORankGulf is not liable for indirect or consequential losses from using the site. Nothing here limits rights you have under applicable consumer law." },
  { type: "h2", text: "Changes" },
  { type: "p", text: "These terms may be updated occasionally; the date at the top shows the latest version. Continued use of the site after changes means you accept them." },
  { type: "h2", text: "Contact" },
  { type: "p", text: "Questions about these terms: email muhammadtauseef714@gmail.com or message us on WhatsApp at +92 315 0642491." },
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
