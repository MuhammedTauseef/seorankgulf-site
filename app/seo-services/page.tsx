import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";
import ServiceCTA from "@/components/ServiceCTA";

const BASE = "https://seorankgulf-site.vercel.app";

export const metadata: Metadata = {
  title: "SEO Services for Gulf Businesses | SEORankGulf",
  description:
    "SEO services for UAE & Gulf businesses — local SEO, technical SEO, content. Month-to-month plans from $300. Free SEO audit.",
  keywords: [
    "SEO services Dubai",
    "SEO agency UAE",
    "SEO company Gulf",
    "SEO services Sharjah",
    "SEO Abu Dhabi",
  ],
  alternates: {
    canonical: `${BASE}/seo-services`,
  },
  openGraph: {
    url: `${BASE}/seo-services`,
    title: "SEO Services for Gulf Businesses | SEORankGulf",
    description:
      "Local SEO, technical SEO, and content SEO for Gulf businesses. Month-to-month plans from $300. Free SEO audit.",
    images: [
      {
        url: `${BASE}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "SEORankGulf — SEO Services for Gulf Businesses",
      },
    ],
  },
};

const faqs = [
  {
    q: "What SEO services does SEORankGulf offer?",
    a: "We offer local SEO (Google Business Profile, maps rankings, local keywords), technical SEO (site speed, mobile fixes, indexing issues), and content SEO (keyword-targeted articles and pages). Every engagement starts with a free SEO audit.",
  },
  {
    q: "How much do your SEO services cost?",
    a: "Starter is $300/month for small businesses in one city, Growth is $600/month (our most popular plan, covering up to 3 cities), and Enterprise is $1,200/month for competitive industries. All plans are month-to-month with no long-term lock-in.",
  },
  {
    q: "How long before I see SEO results?",
    a: "Most clients see initial improvements in 4-8 weeks — better indexing and more impressions. Significant ranking gains typically arrive in 3-6 months. Anyone promising page one in 30 days is not being honest with you.",
  },
  {
    q: "Do you work with businesses outside the UAE?",
    a: "Our specialty is the Gulf market — UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman. The SEO fundamentals we apply work anywhere, but our local expertise is deepest in the Gulf.",
  },
  {
    q: "Can I cancel my SEO plan anytime?",
    a: "Yes. All plans are month-to-month. If we are not delivering value, you walk away — which is exactly why we work hard to deliver it.",
  },
];

/** /seo-services — main SEO services landing page. */
export default function SeoServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "SEO Services for Gulf Businesses",
        provider: { "@type": "Organization", name: "SEORankGulf", url: `${BASE}/` },
        areaServed: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"],
        url: `${BASE}/seo-services`,
        description:
          "Local SEO, technical SEO, and content SEO services for Gulf businesses. Month-to-month plans from $300.",
        offers: [
          { "@type": "Offer", name: "Starter SEO", price: "300", priceCurrency: "USD" },
          { "@type": "Offer", name: "Growth SEO", price: "600", priceCurrency: "USD" },
          { "@type": "Offer", name: "Enterprise SEO", price: "1200", priceCurrency: "USD" },
        ],
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
          <span className="eyebrow">SEO Services</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            SEO services that put Gulf businesses on Google&apos;s first page.
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32, fontSize: "1.1rem", lineHeight: 1.7 }}>
            SEORankGulf provides search engine optimization for businesses in
            Dubai, Abu Dhabi, Sharjah, and across the Gulf. No jargon, no
            lock-in contracts — just the work that gets you found by customers
            searching on Google.
          </p>

          <div className="legal-body">
            <h2>What our SEO services include</h2>
            <p>
              Every SEORankGulf plan covers the three pillars of SEO that
              actually move rankings: local SEO, technical SEO, and content.
              Here is what each one means for your business.
            </p>

            <h2>Local SEO — get found by nearby customers</h2>
            <p>
              When someone in Dubai searches &ldquo;restaurant near me&rdquo;
              or &ldquo;dentist Sharjah,&rdquo; Google shows a map with three
              businesses. Local SEO is the work that puts you in those three
              spots. We optimize your Google Business Profile, build consistent
              listings across UAE directories, manage your reviews, and target
              the exact phrases your local customers type. For most Gulf small
              businesses, local SEO delivers the fastest return.{" "}
              <Link href="/local-seo">Learn more about our local SEO service →</Link>
            </p>

            <h2>Technical SEO — fix what is holding you back</h2>
            <p>
              Google cannot rank a website it cannot read. Technical SEO fixes
              the invisible problems: slow loading pages, mobile usability
              issues, broken links, missing sitemaps, and indexing errors. Many
              businesses are surprised to learn their site has technical issues
              blocking rankings they have already earned.{" "}
              <Link href="/technical-seo">Learn more about our technical SEO service →</Link>
            </p>

            <h2>Content SEO — answer what customers search</h2>
            <p>
              Google ranks pages that best answer the searcher&apos;s question.
              We research the exact keywords your customers use — in English and
              Arabic where it matters — and create or optimize pages that rank
              for them. Our own blog is proof of the approach: practical,
              in-depth guides like our{" "}
              <Link href="/blog/affordable-seo-services-small-business-sharjah">
                affordable SEO guide for Sharjah businesses
              </Link>{" "}
              and our{" "}
              <Link href="/blog/how-much-does-local-seo-cost-abu-dhabi">
                Abu Dhabi SEO pricing guide
              </Link>
              .
            </p>

            <h2>Simple, honest pricing</h2>
            <p>
              Our plans are public and month-to-month — no mystery quotes, no
              twelve-month lock-ins:
            </p>
            <ul>
              <li>
                <strong>Starter — $300/month:</strong> for small businesses in
                one city. Google Business Profile optimization, local keyword
                targeting, on-page fixes, and a readable monthly report.
              </li>
              <li>
                <strong>Growth — $600/month:</strong> our most popular plan.
                Everything in Starter plus content creation, more keywords,
                citation building, and review management across up to 3 cities.
              </li>
              <li>
                <strong>Enterprise — $1,200/month:</strong> for competitive
                industries like real estate, clinics, and legal. Full campaign
                with 30+ keywords, weekly content, and dedicated management.
              </li>
            </ul>
            <p>
              Not sure which fits? That is what the{" "}
              <Link href="/seo-audit">free SEO audit</Link> is for — we look at
              your site and tell you honestly which plan makes sense, or whether
              you need us at all yet.
            </p>

            <h2>Why Gulf businesses choose SEORankGulf</h2>
            <ul>
              <li>
                <strong>Gulf specialization:</strong> we understand bilingual
                search behavior, UAE directories, and how Google Business
                Profile works in this region.
              </li>
              <li>
                <strong>Plain-language reporting:</strong> every month you get a
                report you can actually read — rankings, traffic, calls, and
                exactly what we did.
              </li>
              <li>
                <strong>No lock-in:</strong> month-to-month plans. We earn your
                business every month with results, not contracts.
              </li>
              <li>
                <strong>You own everything:</strong> your Google Business
                Profile, your website, your analytics. We never hold accounts
                hostage.
              </li>
              <li>
                <strong>Honest timelines:</strong> 3-6 months for meaningful
                results. We will never promise page one in 30 days.
              </li>
            </ul>

            <h2>Frequently asked questions</h2>
            {faqs.map((f, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: "1.15rem" }}>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <ServiceCTA heading="Ready to rank higher on Google?" />

          <p style={{ marginTop: 32 }}>
            <Link href="/">← Back to home</Link> ·{" "}
            <Link href="/blog">Read our SEO guides</Link> ·{" "}
            <Link href="/faq">More questions</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
