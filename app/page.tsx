import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";
import { whatsappLink } from "@/lib/site-config";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

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
    text: "Google Business Profile optimization, local citations, and city-specific pages that put you on the map — literally. Built for Dubai, Abu Dhabi, and Sharjah search behavior.",
    tag: "Google Maps · Local rankings · Citations",
  },
  {
    n: "02",
    title: "Technical SEO",
    text: "Full website audit and fixes: page speed, mobile-friendliness, crawlability, schema markup, and Core Web Vitals. The foundation Google rewards with higher rankings.",
    tag: "Audit · Speed · Schema · Core Web Vitals",
  },
  {
    n: "03",
    title: "Content SEO",
    text: "Keyword research and SEO articles written to rank — in-depth, search-intent matched, with FAQs engineered to win featured snippets and AI answers.",
    tag: "Keywords · Articles · Featured snippets",
  },
];

const PROCESS = [
  {
    n: "01",
    title: "Free SEO Audit",
    text: "We analyze your website, competitors, and market — then send you a clear report of what's holding you back. Free, no strings attached.",
  },
  {
    n: "02",
    title: "Strategy & Roadmap",
    text: "You get a plain-language plan: target keywords, technical fixes, and content calendar prioritized by impact.",
  },
  {
    n: "03",
    title: "Execution",
    text: "We implement everything — technical fixes, on-page optimization, local citations, and ranking-focused content.",
  },
  {
    n: "04",
    title: "Report & Refine",
    text: "Monthly reports show exactly what moved and why. We double down on what works, quarter after quarter.",
  },
];

const RESULTS = [
  {
    metric: "3–6 mo",
    title: "Typical ranking window",
    text: "Most clients see significant ranking gains within 3–6 months of consistent execution.",
  },
  {
    metric: "Page 1",
    title: "Local pack targeting",
    text: "We optimize for Google Maps and local results — where Gulf customers actually click.",
  },
  {
    metric: "100%",
    title: "White-hat only",
    text: "No link schemes, no keyword stuffing, no shortcuts that risk penalties. Ever.",
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
    a: "We specialize in the Gulf market: bilingual search considerations, local search behavior, Google Business Profile for UAE, and directories like Dubizzle and Yellow Pages UAE. Specialization beats generalization.",
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

const TESTIMONIALS = [
  {
    quote:
      "Within four months our Google Business Profile started bringing in calls every week. The monthly reports made it easy to see exactly what was working.",
    name: "Restaurant Owner",
    role: "Dubai",
  },
  {
    quote:
      "They explained everything in plain language and never overpromised. Our main service page went from invisible to page one for our area.",
    name: "Clinic Manager",
    role: "Sharjah",
  },
  {
    quote:
      "The free audit alone showed us problems two previous agencies missed. Signing up was an easy decision after that.",
    name: "Retail Store Owner",
    role: "Abu Dhabi",
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
            <a className="nav-link" href="#process">Process</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="/blog">Blog</a>
            <a className="nav-link" href="#faq">FAQ</a>
            <a
              className="nav-cta"
              href={whatsappLink("Hi! I want a free SEO audit for my business.")}
              target="_blank"
              rel="noopener"
            >
              Free SEO Audit
            </a>
          </nav>
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="ag-hero" id="top" aria-labelledby="ag-hero-title">
          <div className="wrap ag-hero-inner">
            <span className="ag-badge">SEO for the Gulf</span>
            <h1 className="ag-title" id="ag-hero-title">
              We Rank Gulf Businesses on{" "}
              <span className="gold">Google&apos;s First Page</span>
            </h1>
            <p className="ag-sub">
              Local SEO, technical SEO, and content SEO for UAE businesses in
              Dubai, Abu Dhabi, and Sharjah. No fluff — just rankings that
              bring customers.
            </p>
            <div className="ag-actions">
              <a
                className="ag-btn ag-btn-gold"
                href={whatsappLink("Hi! I want a free SEO audit for my business.")}
                target="_blank"
                rel="noopener"
              >
                Get Free SEO Audit <span aria-hidden="true">→</span>
              </a>
              <a className="ag-btn ag-btn-ghost" href="#pricing">
                See Pricing
              </a>
            </div>
            <p className="ag-meta">
              <b>Dubai</b> · <b>Abu Dhabi</b> · <b>Sharjah</b> · Month-to-month plans
            </p>
          </div>
        </section>

        {/* CLIENT LOGOS */}
        <section className="ag-logos" aria-label="Trusted by businesses across the Gulf">
          <div className="wrap">
            <p>Trusted by growing businesses across the Gulf</p>
            <div className="ag-logos-row">
              {[1, 2, 3, 4, 5].map((i) => (
                <div className="ag-logo" key={i}>
                  Your logo here
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="ag-sec ag-sec-dark" aria-label="SEORankGulf at a glance" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div className="wrap">
            <div className="ag-stats">
              <div className="ag-stat">
                <strong>50+</strong>
                <span>Keywords ranked on page one</span>
              </div>
              <div className="ag-stat">
                <strong>3</strong>
                <span>Emirates served across the UAE</span>
              </div>
              <div className="ag-stat">
                <strong>100%</strong>
                <span>White-hat methods, no shortcuts</span>
              </div>
              <div className="ag-stat">
                <strong>30-day</strong>
                <span>First results window for most clients</span>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="ag-sec ag-sec-white" id="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">Services</div>
              <h2 className="display" id="services-title">
                SEO that actually moves the needle.
              </h2>
              <p className="section-intro">
                Three focused services. No bloated packages, no jargon — just
                the work that gets Gulf businesses found on Google.
              </p>
            </div>
            <div className="ag-cards">
              {SERVICES.map((s) => (
                <div className="ag-card" key={s.n}>
                  <div className="num">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <p className="tag">{s.tag}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="ag-sec ag-sec-light" id="process" aria-labelledby="process-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">How it works</div>
              <h2 className="display" id="process-title">
                From audit to rankings in four steps.
              </h2>
              <p className="section-intro">
                A clear, repeatable process — you always know what&apos;s
                happening and why.
              </p>
            </div>
            <div className="ag-process">
              {PROCESS.map((p) => (
                <div className="ag-step" key={p.n}>
                  <small>STEP {p.n}</small>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="ag-sec ag-sec-white" id="why" aria-labelledby="why-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">Why SEORankGulf</div>
              <h2 className="display" id="why-title">
                Built for the Gulf, not adapted to it.
              </h2>
              <p className="section-intro">
                Most SEO advice is written for US or UK markets. We work where
                your customers are — and we know how search works here.
              </p>
            </div>
            <div className="ag-cards">
              {[
                {
                  n: "01",
                  title: "Gulf-market focus",
                  text: "We understand bilingual search behavior, UAE directories, and how Google Business Profile works across the Emirates. You don't have to explain your market to us.",
                  tag: "Local expertise",
                },
                {
                  n: "02",
                  title: "Transparent reporting",
                  text: "Every month you get a plain-language report: what we did, what moved, and what's next. No vanity metrics, no jargon walls.",
                  tag: "Clear reports",
                },
                {
                  n: "03",
                  title: "No long contracts",
                  text: "Month-to-month plans. If we're not delivering value, you walk away — which is exactly why we work hard to deliver it.",
                  tag: "Flexible terms",
                },
                {
                  n: "04",
                  title: "Honest about timelines",
                  text: "We won't promise page one in 30 days. We'll tell you what's realistic, then work the plan until it happens.",
                  tag: "Realistic expectations",
                },
              ].map((w) => (
                <div className="ag-card" key={w.n}>
                  <div className="num">{w.n}</div>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                  <p className="tag">{w.tag}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="ag-sec ag-sec-dark" aria-labelledby="results-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">What to expect</div>
              <h2 className="display" id="results-title">
                Realistic results, honestly communicated.
              </h2>
              <p className="section-intro">
                We don&apos;t sell miracles. Here&apos;s what proper SEO
                delivers for Gulf businesses.
              </p>
            </div>
            <div className="ag-results">
              {RESULTS.map((r) => (
                <div className="ag-result" key={r.title}>
                  <div className="metric">{r.metric}</div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="ag-sec ag-sec-tint" id="pricing" aria-labelledby="pricing-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">Pricing</div>
              <h2 className="display" id="pricing-title">
                Simple monthly plans. Cancel anytime.
              </h2>
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
                      ? { border: "2px solid #E63946" }
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
                    className={p.popular ? "btn btn-gold" : "btn btn-navy"}
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

        {/* TESTIMONIALS */}
        <section className="ag-sec ag-sec-white" id="testimonials" aria-labelledby="testimonials-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">Client words</div>
              <h2 className="display" id="testimonials-title">
                What our clients say.
              </h2>
              <p className="section-intro">
                Real feedback from businesses we&apos;ve helped get found.
              </p>
            </div>
            <div className="ag-testis">
              {TESTIMONIALS.map((t, i) => (
                <div className="ag-testi" key={i}>
                  <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <strong>{t.name}</strong>
                  <span className="role">{t.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST ARTICLES */}
        {latestPosts.length > 0 && (
          <section className="ag-sec ag-sec-light" id="latest" aria-labelledby="latest-title">
            <div className="wrap">
              <div className="ag-head">
                <div className="kicker">Fresh this week</div>
                <h2 className="display" id="latest-title">
                  Latest SEO guides.
                </h2>
                <p className="section-intro">
                  Practical SEO knowledge — the same methods we use for clients.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                  marginTop: 36,
                }}
              >
                {latestPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: 16,
                      textDecoration: "none",
                      color: "inherit",
                      background: "var(--paper-2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".75rem",
                        color: "var(--faint)",
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
                          color: "var(--muted)",
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
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <a href="/blog" style={{ fontSize: ".9rem" }}>
                  All articles →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="ag-sec ag-sec-white" id="faq" aria-labelledby="faq-title">
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div className="ag-head">
              <div className="kicker">FAQ</div>
              <h2 className="display" id="faq-title">
                Straight answers before you decide.
              </h2>
            </div>
            <div className="faq" style={{ marginTop: 36 }}>
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
        <section className="ag-sec ag-sec-dark" id="contact" aria-labelledby="contact-title">
          <div className="wrap" style={{ maxWidth: 780, textAlign: "center" }}>
            <div className="kicker">Get started</div>
            <h2 className="display" id="contact-title">
              Get your free SEO audit today.
            </h2>
            <p className="contact-sub">
              We&apos;ll analyze your website and send you a clear report of
              what&apos;s holding you back — free, no strings attached.
            </p>
            <a
              className="ag-btn ag-btn-gold"
              style={{ display: "inline-block", textDecoration: "none" }}
              href={whatsappLink(
                "Hi! I want a free SEO audit for my business. My website is: "
              )}
              target="_blank"
              rel="noopener"
            >
              Chat on WhatsApp <span aria-hidden="true">→</span>
            </a>
            <p className="contact-note">
              Serving Dubai, Abu Dhabi, Sharjah &amp; across the Gulf.
            </p>
          </div>
        </section>
      </main>

      <footer className="ag-footer">
        <div className="wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top" aria-label="SEORankGulf home">
                <span className="brand-mark">S</span>SEORANKGULF
              </a>
              <p className="ag-footer-tag">SEO services for Gulf businesses. Dubai · Abu Dhabi · Sharjah.</p>
            </div>
            <div className="foot-col">
              <h4>Explore</h4>
              <a href="#services">Services</a>
              <a href="#process">Process</a>
              <a href="#pricing">Pricing</a>
              <a href="/blog">Blog</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="foot-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/disclaimer">Disclaimer</a>
            </div>
            <div className="foot-col">
              <h4>Contact</h4>
              <a
                href="https://wa.me/971500000000"
                target="_blank"
                rel="noopener"
                style={{ fontSize: ".85rem" }}
              >
                WhatsApp: +971-50-000-0000
              </a>
              <p className="ag-footer-note">
                Mon–Sat, 9am–6pm GST
              </p>
            </div>
          </div>
          <div className="ag-offices">
            <div className="ag-office">
              <h5>Dubai</h5>
              <p>Serving businesses across Dubai — Deira to JBR, Business Bay to Marina.</p>
            </div>
            <div className="ag-office">
              <h5>Abu Dhabi</h5>
              <p>Local SEO for the capital — Corniche to Yas Island and beyond.</p>
            </div>
            <div className="ag-office">
              <h5>Sharjah</h5>
              <p>Helping Sharjah businesses get found on Google Maps and search.</p>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 SEORankGulf. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
