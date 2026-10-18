import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedDemos, getDemoBySlugDb } from "@/lib/demos-db";
import DemoPlayground from "@/components/DemoPlayground";
import PriceValue from "@/components/PriceValue";
import TrackedLink from "@/components/TrackedLink";

/**
 * /demo/[slug] — dedicated live demo page per business, like the old
 * portfolio's individual demo pages. Opens the chat pre-loaded as that
 * business's AI assistant, with a features rundown above it.
 */

export async function generateStaticParams() {
  const demos = await getPublishedDemos();
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = await getDemoBySlugDb(slug);
  const url = `https://replypilot-site.vercel.app/demo/${slug}`;
  return {
    title: demo ? `${demo.name} — Live AI Demo | ReplyPilot` : "Demo | ReplyPilot",
    description: demo
      ? `Try the live AI assistant for ${demo.name} (${demo.business}). ${demo.text}`
      : "Try a live ReplyPilot AI demo.",
    alternates: { canonical: url },
    openGraph: demo
      ? {
          title: `${demo.name} — Live AI Demo | ReplyPilot`,
          description: `Chat with the AI assistant for ${demo.name}.`,
          url,
          type: "website",
        }
      : undefined,
  };
}

/**
 * Demo → article links (P2 internal linking). Only demos with a VERIFIED
 * matching niche article are mapped — no guessed URLs. Each demo detail
 * page links to its article so crawl/authority flows demo → article.
 */
const DEMO_ARTICLE_LINKS: Record<string, { slug: string; anchor: string }> = {
  "brightsmile-dental": {
    slug: "ai-chatbots-dental-clinics",
    anchor: "how the dental chatbot works",
  },
  "casa-verde-kitchen": {
    slug: "whatsapp-automation-restaurants",
    anchor: "WhatsApp automation for restaurants",
  },
  novakart: {
    slug: "ecommerce-store-assistants",
    anchor: "AI store assistants for e-commerce",
  },
  "ironpulse-fitness": {
    slug: "ai-chatbot-gyms-fitness-studios",
    anchor: "AI chatbots for gyms and fitness studios",
  },
  "fixright-plumbing": {
    slug: "ai-chatbot-plumbers-home-services",
    anchor: "AI chatbots for plumbers",
  },
  "harborline-realty": {
    slug: "ai-chatbot-real-estate-agents",
    anchor: "AI chatbots for real estate agents",
  },
  "luxe-locks-studio": {
    slug: "instagram-dm-automation-salons",
    anchor: "Instagram DM automation for salons",
  },
  "daily-grind-coffee": {
    slug: "ai-chatbot-coffee-shops",
    anchor: "AI chatbots for coffee shops",
  },
};

export default async function DemoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = await getDemoBySlugDb(slug);
  if (!demo) notFound();
  const articleLink = DEMO_ARTICLE_LINKS[slug];

  return (
    <main>
      <section className="hero" style={{ padding: 0 }}>
        <div
          className="wrap hero-inner"
          style={{ paddingTop: 64, paddingBottom: 32 }}
        >
          <Link
            href="/demo"
            style={{
              color: "var(--gold-deep)",
              fontWeight: 700,
              fontSize: ".9rem",
              textDecoration: "none",
            }}
          >
            ← All demos
          </Link>
          <div style={{ height: 18 }} />
          <span className="eyebrow">
            Live demo · {demo.tag}
          </span>
          <h1
            className="hero-statement"
            style={{ fontSize: "clamp(2.2rem,5.5vw,3.8rem)" }}
          >
            {demo.name}
            <span className="dot">.</span>
          </h1>
          <p className="hero-sub" style={{ maxWidth: "44ch" }}>
            An AI assistant for {demo.business} — chat with it below, exactly
            like a real customer would.
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 40 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div className="demo-detail-card">
            <div className="demo-detail-kicker">What this demo shows</div>
            <p>{demo.text}</p>
            <div className="demo-detail-kicker">How the agent behaves</div>
            <p>{demo.blurb}</p>
            {articleLink && (
              <p>
                See the full playbook:{" "}
                <Link href={`/blog/${articleLink.slug}`}>
                  {articleLink.anchor}
                </Link>
                .
              </p>
            )}
            <p className="demo-detail-note">
              Fictional sample for illustration — your free custom demo will
              use your own products, prices, and FAQs.
            </p>
          </div>

          <div style={{ height: 28 }} />

          <DemoPlayground initialDemo={demo} showPicker={false} />

          <div className="demo-cta-card">
            <h2>Want one like this for your business?<PriceValue> — $249</PriceValue>.</h2>
            <p>
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
                  cta_location: "demo-detail",
                  cta_text: "Get Your AI Agent",
                  demo_name: demo.name,
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
