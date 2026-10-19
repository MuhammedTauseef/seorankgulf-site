import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ — SEO Questions Answered | SEORankGulf",
  description:
    "Common questions about SEO services for Gulf businesses — local SEO, pricing, timelines, and what to expect. Answered simply.",
  keywords: [
    "SEO FAQ",
    "SEO services questions",
    "local SEO Dubai FAQ",
    "SEORankGulf FAQ",
  ],
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/faq",
  },
  openGraph: {
    url: "https://seorankgulf-site.vercel.app/faq",
  },
};

const faqs = [
  {
    q: "How long does SEO take to show results?",
    a: "Most clients see initial improvements in 4-8 weeks (better indexing, more impressions). Significant ranking gains typically arrive in 3-6 months. SEO compounds — results grow over time.",
  },
  {
    q: "Do you guarantee first-page rankings?",
    a: "No honest SEO company can guarantee specific rankings. What we guarantee is proven methodology: technical excellence, quality content, and consistent execution that gives you the best possible chance.",
  },
  {
    q: "What is local SEO and do I need it?",
    a: "Local SEO helps your business appear in Google Maps and local search results — critical if customers visit your location or you serve a specific area. For Dubai, Abu Dhabi, and Sharjah businesses, it's usually the highest-ROI starting point.",
  },
  {
    q: "How much do your SEO plans cost?",
    a: "Starter is $300/month (1 city), Growth is $600/month (3 cities, most popular), and Enterprise is $1,200/month. All plans are month-to-month with no long-term contracts.",
  },
  {
    q: "What do you need from me to start?",
    a: "Just your website URL and business details. We handle the audit, strategy, and execution. You'll get a clear monthly report showing what was done and what improved.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month. If we're not delivering value, you walk away — which is exactly why we work hard to deliver it.",
  },
  {
    q: "Do you work with businesses outside the UAE?",
    a: "Our specialty is the Gulf market, but the SEO fundamentals we apply work anywhere. Contact us to discuss your specific situation.",
  },
  {
    q: "Will you change my website's design?",
    a: "We make technical and on-page SEO changes, which are usually invisible to visitors. We won't redesign your site without discussing it with you first.",
  },
  {
    q: "How is SEORankGulf different from other agencies?",
    a: "We specialize in the Gulf market, report in plain language, charge honest month-to-month pricing, and never overpromise. Our free audit shows you our quality before you pay anything.",
  },
  {
    q: "Is my business data safe with you?",
    a: "Yes. Your data is stored securely and never sold or shared. You own your data — your website, your rankings, your business information.",
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
            SEO questions? Answered simply.
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32 }}>
            Everything Gulf business owners ask us about SEO — in plain
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
              Still curious?{" "}
              <Link href="/#contact">Get a free SEO audit</Link> or{" "}
              <Link href="/blog">read our SEO guides</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
