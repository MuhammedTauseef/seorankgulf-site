import type { Metadata } from "next";
import Link from "next/link";
import { getStaticPage } from "@/lib/pages";
import type { Block } from "@/lib/blog";

export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "About — SEORankGulf",
  description:
    "SEORankGulf is an AI automation studio by SEORankGulf team — building practical SEO services for Gulf businesses for growing businesses.",
  alternates: {
    canonical: "https://seorankgulf.com/about",
  },
  openGraph: {
    url: "https://seorankgulf.com/about",
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

/** Fallback content if DB is unavailable. */
const fallbackBlocks: Block[] = [
  { type: "h2", text: "What we do" },
  { type: "p", text: "We build SEO services for Gulf businesses that help small and growing businesses respond faster, capture more leads, and save hours every week." },
  { type: "h2", text: "How we work" },
  { type: "p", text: "Every build starts with understanding your business. Then we design, build, and launch a custom AI agent, usually within 48 hours." },
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
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={block.src} alt={block.alt} style={{ maxWidth: "100%", borderRadius: 8 }} />;
    case "video":
      return (
        <figure key={i} style={{ margin: "24px 0" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={block.src}
            poster={block.poster}
            controls
            preload="metadata"
            style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
          />
          {block.caption && (
            <figcaption
              style={{ marginTop: 8, fontSize: ".9rem", color: "#8b98b8" }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return <p key={i}>{"text" in block ? block.text : ""}</p>;
  }
}

/** /about — who we are, what we do. Content editable via admin. */
export default async function AboutPage() {
  const page = await getStaticPage("about");
  const blocks = page?.content?.length ? page.content : fallbackBlocks;
  const title = page?.title || "About — SEORankGulf";

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">About</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Practical AI for real businesses.
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/founder.jpg"
              alt="SEORankGulf team, founder of SEORankGulf"
              style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(216,189,143,.5)" }}
            />
            <p style={{ color: "#4b5563", margin: 0 }}>
              SEORankGulf is an AI automation studio run by <strong>SEORankGulf team</strong>.
            </p>
          </div>

          <div className="legal-body">
            {blocks.map(renderBlock)}

            {/* Founder & CEO section */}
            <div style={{ marginTop: 40, padding: 24, background: "var(--card)", borderRadius: 16, border: "1px solid rgba(216,189,143,.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/founder.jpg"
                  alt="SEORankGulf team, Founder & CEO of SEORankGulf"
                  style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", border: "2px solid rgba(216,189,143,.5)", flexShrink: 0 }}
                />
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.25rem" }}>SEORankGulf team</h3>
                  <p style={{ margin: 0, color: "var(--gold)", fontSize: ".95rem", fontWeight: 600 }}>Founder & CEO, SEORankGulf</p>
                </div>
              </div>
              <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>
                I&apos;m Tauseef, an AI automation specialist. I build practical sales agents,
                customer-response systems, and workflows that help growing businesses reply
                faster and convert more enquiries.
              </p>
              <p style={{ margin: 0, lineHeight: 1.7 }}>
                Every SEORankGulf system is built around a real bottleneck — unanswered questions,
                missed leads, or repetitive follow-up. One person builds it, tests it, and
                supports it: no agency layers, no templates pretending to be custom.
              </p>
            </div>

            <p style={{ marginTop: 24 }}>
              Want to see what an AI agent could do for your business?{" "}
              <Link href="/contact">Contact us</Link> or try a{" "}
              <Link href="/demo">live demo</Link> — it takes two minutes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
