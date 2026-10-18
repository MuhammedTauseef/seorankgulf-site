import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";
import { whatsappLink } from "@/lib/site-config";

/** SEORankGulf homepage — SEO services for Gulf businesses. */
export const metadata: Metadata = {
  alternates: {
    canonical: "https://seorankgulf.com",
  },
  title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
  description:
    "SEO services for UAE & Gulf businesses. Local SEO, technical SEO, and content SEO that puts you on Google's first page. Free SEO audit.",
  openGraph: {
    title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
    description:
      "SEO services for UAE & Gulf businesses. Local SEO, technical SEO, content SEO. Free SEO audit.",
    type: "website",
    url: "https://seorankgulf.com",
    siteName: "SEORankGulf",
  },
};

const SERVICES = [
  {
    n: "01",
    title: "Local SEO",
    text: "Google Business Profile optimization, local citations, and city-specific pages that put you on the map — literally. Perfect for Dubai, Abu Dhabi, and Sharjah businesses.",
    tag: "Google Maps · Local rankings",
  },
  {
    n: "02",
    title: "Technical SEO",
    text: "Full website audit and fixes: speed, mobile-friendliness, crawlability, schema markup, and Core Web Vitals. The foundation Google rewards.",
    tag: "Audit · Speed · Schema",
  },
  {
    n: "03",
    title: "Content SEO",
    text: "Keyword research and SEO articles written to rank — 2,500+ words, search-intent matched, with FAQs that win featured snippets.",
    tag: "Keywords · Articles · Snippets",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$300",
    period: "/month",
    features: [
      "Local SEO for 1 city",
      "Google Business Profile setup",
      "10 keywords tracked",
      "2 SEO articles / month",
      "Monthly report",
    ],
  },
  {
    name: "Growth",
    price: "$600",
    period: "/month",
    features: [
      "Local SEO for 3 cities",
      "Technical SEO audit + fixes",
      "25 keywords tracked",
      "4 SEO articles / month",
      "Bi-weekly reports",
      "Competitor analysis",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$1,200",
    period: "/month",
    features: [
      "Multi-city + national SEO",
      "Full technical overhaul",
      "50 keywords tracked",
      "8 SEO articles / month",
      "Weekly reports + calls",
      "Dedicated strategist",
    ],
  },
];

const FAQS = [
  {
    q: "How long does SEO take to show results?",
    a: "Most clients see initial improvements in 4-8 weeks (indexing, impressions). Significant ranking gains typically arrive in 3-6 months. SEO is a compounding investment — results grow over time.",
  },
  {
    q: "Do you guarantee first-page rankings?",
    a: "No honest SEO company can guarantee specific rankings — anyone who does is misleading you. What we guarantee is proven methodology: technical excellence, quality content, and consistent execution that gives you the best possible chance.",
  },
  {
    q: "Why focus on Gulf/UAE businesses?",
    a: "We specialize in the Gulf market: bilingual considerations, local search behavior, Google Business Profile for UAE, and directories like Dubizzle. Specialization beats generalization.",
  },
  {
    q: "What do you need from me to start?",
    a: "Just your website URL and business details. We handle the audit, strategy, and execution. You'll get a clear report each month showing exactly what was done and what improved.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Our plans are month-to-month with no long-term lock-in. We earn your business every month with results, not contracts.",
  },
];

export default async function Home() {
  const latestPosts = (await getPublishedPosts()).slice(0, 3);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="#top" aria-label="SEORankGulf home">
            <span className="brand-mark">S</span>SEORANKGULF
          </a>
          <nav className="site-nav" aria-label="Primary navigation">
            <a className="nav-link" href="#services">Services</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="/blog">Blog</a>
            <a className="nav-link" href="#faq">FAQ</a>
            <a className="nav-link" href="#contact">Contact</a>
            <a
              className="nav-cta"
              href={whatsappLink("Hi! I want a free SEO audit for my business.")}
              target="_blank"
              rel="noopener"
            >
              Free SEO Audit
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="hero-v2" id="top" aria-labelledby="hero-v2-title">
          <div className="hero-v2-bubble hero-v2-b1" aria-hidden="true" />
          <div className="hero-v2-bubble hero-v2-b2" aria-hidden="true" />
          <div className="hero-v2-bubble hero-v2-b3" aria-hidden="true" />
          <div className="hero-v2-bubble hero-v2-b4" aria-hidden="true" />
          <div className="wrap hero-v2-inner">
            <span className="hero-v2-eyebrow">SEO for the Gulf</span>
            <h1 className="hero-v2-title" id="hero-v2-title">
              We Rank Gulf Businesses on{" "}
              <span className="hero-v2-gold">Google&apos;s First Page</span>
            </h1>
            <p className="hero-v2-sub">
              Local SEO, technical SEO, and content SEO for UAE businesses in
              Dubai, Abu Dhabi, and Sharjah. No fluff — just rankings that
              bring customers.
            </p>
            <div className="hero-v2-actions">
              <a
                className="hero-v2-btn hero-v2-btn-gold"
                href={whatsappLink("Hi! I want a free SEO audit for my business.")}
                target="_blank"
                rel="noopener"
              >
                Get Free SEO Audit <span aria-hidden="true">→</span>
              </a>
              <a className="hero-v2-btn hero-v2-btn-ghost" href="#pricing">
                See Pricing
              </a>
            </div>
            <p className="hero-v2-trust">
              Dubai <span className="hero-v2-dot">•</span> Abu Dhabi{" "}
              <span className="hero-v2-dot">•</span> Sharjah{" "}
              <span className="hero-v2-dot">•</span> Free audit
            </p>
          </div>
        </section>

        {/* TRUST INDICATORS */}
        <div className="stats" role="region" aria-label="SEORankGulf at a glance">
          <div className="wrap stats-grid">
            <div className="stat">
              <strong>50+</strong>
              <span>Keywords ranked on page one</span>
            </div>
            <div className="stat">
              <strong>3</strong>
              <span>Emirates served across the UAE</span>
            </div>
            <div className="stat">
              <strong>100%</strong>
              <span>White-hat methods, no shortcuts</span>
            </div>
            <div className="stat">
              <strong>30-day</strong>
              <span>First results window for most clients</span>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <section className="block" id="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Services</div>
                <h2 className="display" id="services-title">
                  SEO that actually moves the needle.
                </h2>
              </div>
              <p className="section-intro">
                Three focused services. No bloated packages, no jargon — just
                the work that gets Gulf businesses found on Google.
              </p>
            </div>
            <div className="steps">
              {SERVICES.map((s) => (
                <div className="step" key={s.n}>
                  <small>{s.n}</small>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <p style={{ fontSize: ".8rem", color: "#6b7280" }}>{s.tag}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="block" id="why" aria-labelledby="why-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Why SEORankGulf</div>
                <h2 className="display" id="why-title">
                  Built for the Gulf, not adapted to it.
                </h2>
              </div>
              <p className="section-intro">
                Most SEO advice is written for US or UK markets. We work where
                your customers are — and we know how search works here.
              </p>
            </div>
            <div className="steps">
              <div className="step">
                <small>01</small>
                <h3>Gulf-market focus</h3>
                <p>
                  We understand bilingual search behavior, UAE directories,
                  and how Google Business Profile works across the Emirates.
                  You don&apos;t have to explain your market to us.
                </p>
              </div>
              <div className="step">
                <small>02</small>
                <h3>Transparent reporting</h3>
                <p>
                  Every month you get a plain-language report: what we did,
                  what moved, and what&apos;s next. No vanity metrics, no
                  jargon walls.
                </p>
              </div>
              <div className="step">
                <small>03</small>
                <h3>No long contracts</h3>
                <p>
                  Month-to-month plans. If we&apos;re not delivering value,
                  you walk away — which is exactly why we work hard to
                  deliver it.
                </p>
              </div>
              <div className="step">
                <small>04</small>
                <h3>Honest about timelines</h3>
                <p>
                  We won&apos;t promise page one in 30 days. We&apos;ll tell
                  you what&apos;s realistic, then work the plan until it
                  happens.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="block" id="pricing" aria-labelledby="pricing-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Pricing</div>
                <h2 className="display" id="pricing-title">
                  Simple monthly plans. Cancel anytime.
                </h2>
              </div>
              <p className="section-intro">
                Month-to-month. No long contracts. We earn your business with
                results.
              </p>
            </div>
            <div className="price-cards">
              {PLANS.map((p) => (
                <div
                  className="price-card"
                  key={p.name}
                  style={
                    p.popular
                      ? { border: "2px solid #f59e0b" }
                      : undefined
                  }
                >
                  {p.popular && (
                    <div className="price-tag">Most Popular</div>
                  )}
                  <h3 style={{ margin: "0 0 8px" }}>{p.name}</h3>
                  <div className="price-line">
                    <strong style={{ fontSize: "2rem" }}>
                      {p.price}
                      <em style={{ fontSize: "1rem" }}>{p.period}</em>
                    </strong>
                  </div>
                  <ul className="included">
                    {p.features.map((f) => (
                      <li key={f}>
                        <span className="check">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    className={p.popular ? "btn btn-gold" : "btn btn-ghost"}
                    style={{ width: "100%", textAlign: "center", display: "block" }}
                    href={whatsappLink(`Hi! I'm interested in the ${p.name} plan (${p.price}${p.period}).`)}
                    target="_blank"
                    rel="noopener"
                  >
                    Start with {p.name}{" "}
                    <span className="arrow" aria-hidden="true">→</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST ARTICLES */}
        {latestPosts.length > 0 && (
          <section className="block" id="latest" aria-labelledby="latest-title">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <div className="kicker">Fresh this week</div>
                  <h2 className="display" id="latest-title">
                    Latest SEO guides.
                  </h2>
                </div>
                <p className="section-intro">
                  Practical SEO knowledge — the same methods we use for clients.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {latestPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    style={{
                      border: "1px solid var(--border, #e2e2e2)",
                      borderRadius: 12,
                      padding: 16,
                      textDecoration: "none",
                      color: "inherit",
                      background: "var(--card, #fff)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".75rem",
                        color: "#6b7280",
                        marginBottom: 6,
                      }}
                    >
                      {new Date(p.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {p.title}
                    </strong>
                    {p.excerpt && (
                      <span
                        style={{
                          fontSize: ".85rem",
                          color: "#6b7280",
                          display: "block",
                        }}
                      >
                        {p.excerpt.length > 110
                          ? p.excerpt.slice(0, 110) + "…"
                          : p.excerpt}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <a href="/blog" style={{ fontSize: ".9rem" }}>
                  All articles →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* CLIENT LOGOS */}
        <section
          className="block"
          aria-label="Trusted by businesses across the Gulf"
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          <div className="wrap" style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: ".8rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#6b7280",
                marginBottom: 16,
              }}
            >
              Trusted by growing businesses across the Gulf
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 140,
                    height: 64,
                    border: "1px dashed var(--border, #e2e2e2)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".75rem",
                    color: "#9ca3af",
                  }}
                >
                  Your logo here
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section
          className="block"
          id="testimonials"
          aria-labelledby="testimonials-title"
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">Client words</div>
                <h2 className="display" id="testimonials-title">
                  What our clients say.
                </h2>
              </div>
              <p className="section-intro">
                Real feedback from businesses we&apos;ve helped get found.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  quote:
                    "Within four months our Google Business Profile started bringing in calls every week. The monthly reports made it easy to see exactly what was working.",
                  name: "— Restaurant Owner, Dubai",
                  note: "PLACEHOLDER — replace with a real client testimonial",
                },
                {
                  quote:
                    "They explained everything in plain language and never overpromised. Our main service page went from invisible to page one for our area.",
                  name: "— Clinic Manager, Sharjah",
                  note: "PLACEHOLDER — replace with a real client testimonial",
                },
                {
                  quote:
                    "The free audit alone showed us problems two previous agencies missed. Signing up was an easy decision after that.",
                  name: "— Retail Store Owner, Abu Dhabi",
                  note: "PLACEHOLDER — replace with a real client testimonial",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid var(--border, #e2e2e2)",
                    borderRadius: 12,
                    padding: 20,
                    background: "var(--card, #fff)",
                  }}
                >
                  <p style={{ fontStyle: "italic", marginBottom: 12 }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <strong style={{ fontSize: ".9rem" }}>{t.name}</strong>
                  <p
                    style={{
                      fontSize: ".72rem",
                      color: "#9ca3af",
                      marginTop: 8,
                    }}
                  >
                    {t.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="block" id="faq" aria-labelledby="faq-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="kicker">FAQ</div>
                <h2 className="display" id="faq-title">
                  Straight answers before you decide.
                </h2>
              </div>
            </div>
            <div className="faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section
          className="block contact-sec"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="wrap" style={{ maxWidth: 780, textAlign: "center" }}>
            <div className="kicker">Get started</div>
            <h2 className="display" id="contact-title">
              Get your free SEO audit today.
            </h2>
            <p style={{ marginTop: 24, marginBottom: 32 }}>
              We&apos;ll analyze your website and send you a clear report of
              what&apos;s holding you back — free, no strings attached.
            </p>
            <a
              className="hero-v2-btn hero-v2-btn-gold"
              style={{ display: "inline-block", textDecoration: "none" }}
              href={whatsappLink(
                "Hi! I want a free SEO audit for my business. My website is: "
              )}
              target="_blank"
              rel="noopener"
            >
              Chat on WhatsApp <span aria-hidden="true">→</span>
            </a>
            <p style={{ marginTop: 24, fontSize: ".9rem", color: "#6b7280" }}>
              Serving Dubai, Abu Dhabi, Sharjah &amp; across the Gulf.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top" aria-label="SEORankGulf home">
                <span className="brand-mark">S</span>SEORANKGULF
              </a>
              <p>SEO services for Gulf businesses. Dubai · Abu Dhabi · Sharjah.</p>
            </div>
            <div className="foot-col">
              <h4>Explore</h4>
              <a href="#services">Services</a>
              <a href="#pricing">Pricing</a>
              <a href="/blog">Blog</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="foot-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </div>
            <div className="foot-col">
              <h4>Office</h4>
              <p style={{ fontSize: ".85rem", color: "#6b7280", margin: 0 }}>
                Serving Dubai, Abu Dhabi
                <br />
                &amp; Sharjah, UAE
              </p>
              <a
                href="https://wa.me/971500000000"
                target="_blank"
                rel="noopener"
                style={{ fontSize: ".85rem" }}
              >
                WhatsApp: +971-50-000-0000
              </a>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 SEORankGulf. Built with care.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
