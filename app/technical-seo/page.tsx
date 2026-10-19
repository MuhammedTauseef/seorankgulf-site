import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";
import ServiceCTA from "@/components/ServiceCTA";

const BASE = "https://seorankgulf-site.vercel.app";

export const metadata: Metadata = {
  title: "Technical SEO Audit & Fixes UAE | SEORankGulf",
  description:
    "Technical SEO for Gulf websites — site speed, mobile fixes, indexing errors, Core Web Vitals. Find what's blocking your rankings. Free audit.",
  keywords: [
    "technical SEO Dubai",
    "website speed optimization UAE",
    "technical SEO audit",
    "Core Web Vitals fix",
    "SEO site audit Gulf",
  ],
  alternates: {
    canonical: `${BASE}/technical-seo`,
  },
  openGraph: {
    url: `${BASE}/technical-seo`,
    title: "Technical SEO Audit & Fixes | SEORankGulf",
    description:
      "Fix the invisible problems blocking your Google rankings — speed, mobile, indexing. Free technical audit for Gulf businesses.",
    images: [
      {
        url: `${BASE}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "SEORankGulf — Technical SEO Services",
      },
    ],
  },
};

const faqs = [
  {
    q: "What is technical SEO?",
    a: "Technical SEO fixes the behind-the-scenes issues that stop Google from properly crawling, understanding, and ranking your website — site speed, mobile usability, broken links, indexing errors, and site structure.",
  },
  {
    q: "How do I know if my site has technical SEO problems?",
    a: "Common signs: pages not appearing in Google, slow loading (especially on mobile), high bounce rates, or rankings that never improve despite good content. Our free SEO audit checks all of these.",
  },
  {
    q: "Will technical SEO changes affect how my site looks?",
    a: "Almost never. Technical fixes happen under the hood — code, server settings, and metadata. Your visitors see a faster, better-working site; the design stays the same unless we discuss changes with you first.",
  },
  {
    q: "How much does a technical SEO audit cost?",
    a: "Our initial technical audit is free. It covers speed, mobile usability, indexing, and the most common blocking issues, with honest recommendations. Ongoing technical SEO is included in our monthly plans from $300/month.",
  },
  {
    q: "How long do technical fixes take?",
    a: "Most technical issues are fixed in the first 1-2 months of working together. Speed improvements are often visible within days; the ranking benefit follows as Google re-crawls your improved pages.",
  },
];

/** /technical-seo — technical SEO service landing page. */
export default function TechnicalSeoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Technical SEO Audit and Fixes",
        provider: { "@type": "Organization", name: "SEORankGulf", url: `${BASE}/` },
        areaServed: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"],
        url: `${BASE}/technical-seo`,
        description:
          "Technical SEO for Gulf websites: site speed optimization, mobile fixes, indexing errors, Core Web Vitals, and site structure.",
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
          <span className="eyebrow">Technical SEO</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Fix the invisible problems blocking your Google rankings.
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32, fontSize: "1.1rem", lineHeight: 1.7 }}>
            Google cannot rank a website it cannot read. Our technical SEO
            service finds and fixes the hidden issues — speed, mobile,
            indexing — that silently cost Gulf businesses customers every day.
          </p>

          <div className="legal-body">
            <h2>What is technical SEO?</h2>
            <p>
              Think of your website as a shop. Content SEO is the signboard and
              the products on the shelves. Technical SEO is the foundation, the
              wiring, and the doors: if the doors are stuck, customers cannot
              get in no matter how good the products are.
            </p>
            <p>
              Google works the same way. Its crawlers need to access your
              pages, understand them quickly, and confirm they work well on
              phones. When anything in that chain breaks, your rankings suffer —
              often without any visible warning.
            </p>

            <h2>Technical issues we find and fix</h2>
            <ul>
              <li>
                <strong>Slow loading pages</strong> — over half of mobile
                visitors leave if a page takes more than 3 seconds. We
                compress images, clean up code, and optimize loading so your
                pages open fast on UAE mobile networks.
              </li>
              <li>
                <strong>Mobile usability problems</strong> — Google ranks the
                mobile version of your site first. Buttons too close together,
                text too small, content wider than the screen: we fix them all.
              </li>
              <li>
                <strong>Indexing errors</strong> — pages Google cannot find or
                refuses to index. We check your sitemap, robots settings, and
                Search Console coverage, then fix what is blocking you.
              </li>
              <li>
                <strong>Broken links and redirects</strong> — dead pages and
                redirect chains waste your crawl budget and frustrate visitors.
              </li>
              <li>
                <strong>Missing metadata</strong> — titles, descriptions, and
                structured data that help Google understand each page. We add
                what is missing and fix what is duplicated.
              </li>
              <li>
                <strong>Core Web Vitals</strong> — Google&apos;s official speed
                and stability metrics (LCP, INP, CLS). We measure and improve
                them.
              </li>
              <li>
                <strong>HTTPS and security issues</strong> — mixed content
                warnings and insecure pages that erode trust and rankings.
              </li>
            </ul>

            <h2>How our technical SEO service works</h2>
            <p>
              <strong>Step 1 — Free audit.</strong> We run a full technical
              checkup of your website: speed tests, mobile checks, crawl
              analysis, and Search Console review. You get an honest report of
              what is broken and what it costs you.{" "}
              <Link href="/seo-audit">Get your free audit here.</Link>
            </p>
            <p>
              <strong>Step 2 — Prioritized fixes.</strong> We fix issues in
              order of impact: the things blocking rankings first, nice-to-haves
              later. Most technical fixes land in the first 1-2 months.
            </p>
            <p>
              <strong>Step 3 — Ongoing monitoring.</strong> Websites break over
              time — plugins update, pages get deleted, speed creeps up. Our
              monthly plans include continuous monitoring so problems get caught
              before they cost you rankings.
            </p>

            <h2>Technical SEO and local SEO work together</h2>
            <p>
              Technical SEO is the foundation;{" "}
              <Link href="/local-seo">local SEO</Link> is what builds on it. A
              fast, crawlable site with an optimized Google Business Profile
              outranks a slow site every time. That is why our{" "}
              <Link href="/seo-services">SEO service plans</Link> include both —
              starting at $300/month, month-to-month, no lock-in.
            </p>

            <h2>Frequently asked questions</h2>
            {faqs.map((f, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: "1.15rem" }}>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <ServiceCTA heading="Find out what's blocking your rankings" />

          <p style={{ marginTop: 32 }}>
            <Link href="/seo-services">← All SEO services</Link> ·{" "}
            <Link href="/seo-audit">Free SEO audit</Link> ·{" "}
            <Link href="/blog">SEO guides</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
