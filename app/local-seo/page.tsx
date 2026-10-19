import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/json-ld";
import ServiceCTA from "@/components/ServiceCTA";

const BASE = "https://seorankgulf-site.vercel.app";

export const metadata: Metadata = {
  title: "Local SEO Services UAE | Google Maps Ranking | SEORankGulf",
  description:
    "Local SEO for Gulf businesses — Google Business Profile, maps rankings, local keywords. Rank in Dubai, Abu Dhabi, Sharjah. Free audit.",
  keywords: [
    "local SEO Dubai",
    "Google Business Profile optimization",
    "local SEO Abu Dhabi",
    "Google Maps ranking UAE",
    "local SEO Sharjah",
  ],
  alternates: {
    canonical: `${BASE}/local-seo`,
  },
  openGraph: {
    url: `${BASE}/local-seo`,
    title: "Local SEO Services UAE | SEORankGulf",
    description:
      "Get found on Google Maps by nearby customers. Local SEO for Dubai, Abu Dhabi, Sharjah businesses. Free SEO audit.",
    images: [
      {
        url: `${BASE}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "SEORankGulf — Local SEO Services for Gulf Businesses",
      },
    ],
  },
};

const faqs = [
  {
    q: "What is local SEO?",
    a: "Local SEO is the work that helps your business appear in Google Maps and local search results when nearby customers search for what you offer — for example 'dentist near me' or 'best mandi Sharjah'.",
  },
  {
    q: "How long does local SEO take?",
    a: "Google Business Profile improvements can show results in 4-8 weeks. Competitive map rankings typically take 3-6 months of consistent work — profile optimization, reviews, citations, and local content.",
  },
  {
    q: "Do I need a website for local SEO?",
    a: "A Google Business Profile alone can bring calls, but a fast, mobile-friendly website significantly improves your rankings and converts more visitors. We can advise on both in your free audit.",
  },
  {
    q: "How much does local SEO cost in the UAE?",
    a: "Our Starter plan at $300/month covers local SEO essentials for one city. Most small businesses in Dubai, Abu Dhabi, or Sharjah start here. See our Abu Dhabi SEO pricing guide for detailed UAE price ranges.",
  },
  {
    q: "Can you help with Arabic local SEO?",
    a: "Yes. Many Gulf customers search in Arabic, and ranking for Arabic keywords roughly doubles the opportunity. We research and target both English and Arabic local search terms.",
  },
];

/** /local-seo — local SEO service landing page. */
export default function LocalSeoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Local SEO Services",
        provider: { "@type": "Organization", name: "SEORankGulf", url: `${BASE}/` },
        areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "United Arab Emirates"],
        url: `${BASE}/local-seo`,
        description:
          "Local SEO for Gulf businesses: Google Business Profile optimization, maps rankings, local keywords, citations, and review management.",
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
          <span className="eyebrow">Local SEO</span>
          <h1 className="display" style={{ marginBottom: 12 }}>
            Get found on Google Maps by customers near you.
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32, fontSize: "1.1rem", lineHeight: 1.7 }}>
            When someone nearby searches for what you sell, Google shows three
            businesses on the map. Our local SEO service puts Gulf businesses —
            in Dubai, Abu Dhabi, Sharjah, and beyond — into those three spots.
          </p>

          <div className="legal-body">
            <h2>Why local SEO matters in the Gulf</h2>
            <p>
              In the UAE, the first place people look for a local business is
              Google — not flyers, not newspapers. When someone searches
              &ldquo;near me,&rdquo; Google shows a map with three businesses.
              Those three get the calls, the direction requests, and the
              walk-ins. Everyone else is invisible.
            </p>
            <p>
              Local SEO is the work that earns you one of those three spots. It
              is also one of the highest-return investments a small business can
              make: you are not trying to rank across the whole internet, just
              in your city, for the services you actually offer.
            </p>

            <h2>What our local SEO service includes</h2>
            <ul>
              <li>
                <strong>Google Business Profile optimization</strong> — your
                single most important local ranking factor. We claim, complete,
                and optimize your profile: categories, services, photos, hours,
                and posts that keep it active.
              </li>
              <li>
                <strong>Local keyword research</strong> — we find the exact
                phrases your customers type, in English and Arabic where it
                matters: &ldquo;car wash Sharjah,&rdquo; &ldquo;best salon Abu
                Dhabi,&rdquo; and hundreds more.
              </li>
              <li>
                <strong>Local citations</strong> — your business name, address,
                and phone number listed consistently across UAE directories.
                Inconsistent listings confuse Google and cost you rankings.
              </li>
              <li>
                <strong>Review strategy</strong> — a simple system for getting
                more genuine Google reviews from happy customers. Reviews are a
                top-three local ranking factor.
              </li>
              <li>
                <strong>Local content</strong> — pages and posts targeting your
                service + city combinations, so Google sees you as the relevant
                choice for each area you serve.
              </li>
              <li>
                <strong>Monthly reporting</strong> — map rankings, calls,
                direction requests, and exactly what we did that month, in plain
                language.
              </li>
            </ul>

            <h2>Local SEO pricing</h2>
            <p>
              Local SEO is included in all our plans. Most small businesses
              start with <strong>Starter at $300/month</strong> — Google
              Business Profile work, local keywords, on-page fixes, and monthly
              reporting for one city. Businesses competing in 2-3 cities or
              tougher industries typically choose{" "}
              <strong>Growth at $600/month</strong>. For detailed UAE price
              ranges, read our{" "}
              <Link href="/blog/how-much-does-local-seo-cost-abu-dhabi">
                Abu Dhabi SEO pricing guide
              </Link>{" "}
              and our{" "}
              <Link href="/blog/affordable-seo-services-small-business-sharjah">
                affordable SEO guide for Sharjah
              </Link>
              .
            </p>

            <h2>Local SEO for every Gulf city</h2>
            <p>
              We serve businesses across the UAE and the wider Gulf: Dubai, Abu
              Dhabi, Sharjah, Ajman, Ras Al Khaimah, and Fujairah — plus Saudi
              Arabia, Qatar, Kuwait, Bahrain, and Oman. Each city gets its own
              keyword strategy, because customers in Sharjah search differently
              from customers in Dubai.
            </p>

            <h2>Frequently asked questions</h2>
            {faqs.map((f, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: "1.15rem" }}>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <ServiceCTA heading="Want more calls from Google Maps?" />

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
