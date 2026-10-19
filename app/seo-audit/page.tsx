import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";
import ServiceCTA from "@/components/ServiceCTA";

const BASE = "https://seorankgulf-site.vercel.app";

export const metadata: Metadata = {
  title: "Free SEO Audit for Gulf Businesses | SEORankGulf",
  description:
    "Free SEO audit — see exactly what's holding your website back on Google. Honest recommendations, no obligation. For UAE & Gulf businesses.",
  keywords: [
    "free SEO audit",
    "SEO audit Dubai",
    "website SEO checkup UAE",
    "free website audit",
    "SEO analysis Sharjah",
  ],
  alternates: {
    canonical: `${BASE}/seo-audit`,
  },
  openGraph: {
    url: `${BASE}/seo-audit`,
    title: "Free SEO Audit for Gulf Businesses | SEORankGulf",
    description:
      "See exactly what's holding your website back on Google — free, honest, no obligation.",
    images: [
      {
        url: `${BASE}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "SEORankGulf — Free SEO Audit",
      },
    ],
  },
};

const faqs = [
  {
    q: "Is the SEO audit really free?",
    a: "Yes — completely free, no credit card, no obligation. It is how we show you the quality of our thinking before you spend anything. If you never become a client, the audit is still yours to keep.",
  },
  {
    q: "What does the audit cover?",
    a: "Your Google Business Profile, site speed and mobile usability, indexing status, on-page SEO (titles, headings, content), local keyword opportunities, and a review of your top competitors' positioning.",
  },
  {
    q: "How do I get my audit?",
    a: "Message us on WhatsApp at +92 315 0642491 or use the contact page with your website URL. We prepare the audit and walk you through it — usually within a couple of business days.",
  },
  {
    q: "Will you try to sell me something during the audit?",
    a: "We will tell you honestly whether you need us. If your site needs little work, we will say so. If a plan fits, we will recommend one — Starter $300, Growth $600, or Enterprise $1,200 — but the decision is always yours.",
  },
  {
    q: "Do you audit websites outside the UAE?",
    a: "Yes. Our specialty is the Gulf market, but we audit websites for businesses anywhere. The fundamentals are the same; our Gulf-specific recommendations apply where relevant.",
  },
];

/** /seo-audit — free SEO audit offer landing page. */
export default function SeoAuditPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Free SEO Audit",
        provider: { "@type": "Organization", name: "SEORankGulf", url: `${BASE}/` },
        areaServed: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"],
        url: `${BASE}/seo-audit`,
        description:
          "Free SEO audit for Gulf businesses: Google Business Profile review, technical checkup, keyword opportunities, and honest recommendations.",
        offers: { "@type": "Offer", name: "Free SEO Audit", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <section className="block">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Free SEO Audit</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            See exactly what is holding your website back — free.
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32, fontSize: "1.1rem", lineHeight: 1.7 }}>
            A complete checkup of your website and Google presence, with honest
            recommendations and zero obligation. It is the smartest first step
            before you spend a single dirham on SEO.
          </p>

          <div className="legal-body">
            <h2>What your free audit covers</h2>
            <ul>
              <li>
                <strong>Google Business Profile review</strong> — is your
                profile claimed, complete, and optimized? Most businesses are
                missing easy wins here.
              </li>
              <li>
                <strong>Technical health check</strong> — site speed, mobile
                usability, indexing errors, and broken links. The invisible
                problems that silently block rankings.
              </li>
              <li>
                <strong>On-page SEO review</strong> — titles, headings,
                descriptions, and content quality across your key pages.
              </li>
              <li>
                <strong>Keyword opportunities</strong> — the searches your
                customers are making that you are not showing up for yet.
              </li>
              <li>
                <strong>Competitor snapshot</strong> — who outranks you in your
                area, and what they are doing that you are not.
              </li>
            </ul>

            <h2>Why we offer it free</h2>
            <p>
              Two reasons. First, it is genuinely useful: many businesses fix
              the easy issues from the audit themselves and never need us —
              and that is fine. Second, it shows you how we think before you
              pay anything. If our audit is sharp and honest, you can trust our
              paid work will be too.
            </p>
            <p>
              There is no catch, no credit card, and no 47-email drip sequence
              afterwards. You get the audit, we answer your questions, and you
              decide what happens next.
            </p>

            <h2>What happens after the audit?</h2>
            <p>
              Three possibilities, and we will tell you honestly which one
              applies:
            </p>
            <ul>
              <li>
                <strong>Your site needs little work</strong> — we tell you
                what to fix yourself and part as friends.
              </li>
              <li>
                <strong>A monthly plan fits</strong> — Starter ($300), Growth
                ($600), or Enterprise ($1,200), depending on your market and
                goals. Month-to-month, cancel anytime.
              </li>
              <li>
                <strong>You need something else first</strong> — sometimes a
                new website or a different marketing channel makes more sense.
                We will say so rather than sell you SEO you do not need.
              </li>
            </ul>
            <p>
              Want to understand typical costs first? Read our{" "}
              <Link href="/blog/how-much-does-local-seo-cost-abu-dhabi">
                Abu Dhabi SEO pricing guide
              </Link>{" "}
              or our{" "}
              <Link href="/blog/affordable-seo-services-small-business-sharjah">
                affordable SEO guide for Sharjah
              </Link>
              .
            </p>

            <h2>Frequently asked questions</h2>
            {faqs.map((f, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: "1.15rem" }}>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <ServiceCTA heading="Claim your free SEO audit" />

          <p style={{ marginTop: 32 }}>
            <Link href="/seo-services">← All SEO services</Link> ·{" "}
            <Link href="/contact">Contact us</Link> ·{" "}
            <Link href="/faq">More questions</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
