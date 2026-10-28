import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";
import { whatsappLinkFor } from "@/lib/site-config";
import {
  getSiteContent,
  getWhatsappNumber,
  getWhatsappDisplay,
} from "@/lib/site-content";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";
import AuthNav from "@/components/AuthNav";
import LogoMark from "@/components/LogoMark";
import { safeJsonLd } from "@/lib/json-ld";

/** SEORankGulf homepage — SEO services for Gulf businesses. */
export const metadata: Metadata = {
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app",
  },
  title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
  description:
    "SEO services for UAE & Gulf businesses. Local SEO, technical SEO, and content SEO that puts you on Google's first page. Free SEO audit.",
  openGraph: {
    title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
    description:
      "SEO services for UAE & Gulf businesses. Local SEO, technical SEO, content SEO. Free SEO audit.",
    type: "website",
    url: "https://seorankgulf-site.vercel.app",
    siteName: "SEORankGulf",
    images: [
      {
        url: "https://seorankgulf-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SEORankGulf — SEO Services for Gulf Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
    description:
      "SEO services for UAE & Gulf businesses. Free SEO audit.",
    images: ["https://seorankgulf-site.vercel.app/og-image.jpg"],
  },
};



export default async function Home() {
  const latestPosts = (await getPublishedPosts()).slice(0, 3);
  const c = await getSiteContent();
  const waNumber = await getWhatsappNumber();
  const waDisplay = await getWhatsappDisplay();
  const wa = (message: string) => whatsappLinkFor(waNumber, message);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "SEORankGulf",
            url: "https://seorankgulf-site.vercel.app/",
            description:
              "SEO services for UAE & Gulf businesses: local SEO, technical SEO, content SEO, and SEO audits. Plans from $300 per month.",
            founder: {
              "@type": "Person",
              name: "Muhammad Tauseef",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "sales",
              telephone: "+92 315 0642491",
              availableLanguage: "en",
            },
            areaServed: [
              "United Arab Emirates",
              "Australia",
              "Canada",
              "United States",
              "United Kingdom",
              "New Zealand",
            ],
            makesOffer: {
              "@type": "OfferCatalog",
              name: "SEO service plans",
              itemListElement: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "300",
                  priceCurrency: "USD",
                  description: "Monthly SEO plan for small local businesses.",
                },
                {
                  "@type": "Offer",
                  name: "Growth",
                  price: "600",
                  priceCurrency: "USD",
                  description: "Monthly SEO plan for growing businesses.",
                },
                {
                  "@type": "Offer",
                  name: "Enterprise",
                  price: "1200",
                  priceCurrency: "USD",
                  description:
                    "Monthly SEO plan for competitive industries and multi-location businesses.",
                },
              ],
            },
          }),
        }}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="/" aria-label="SEORankGulf home">
            <span className="brand-mark"><LogoMark /></span>SEORANKGULF
          </a>
          <div className="header-actions">
            <a
              className="nav-cta"
              href={wa(c.hero.cta1Message)}
              target="_blank"
              rel="noopener"
            >
              {c.hero.cta1Text}
            </a>
            <ThemeToggle />
            <MobileNav>
              <AuthNav />
            </MobileNav>
          </div>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="ag-hero" id="top" aria-labelledby="ag-hero-title">
          <div className="wrap ag-hero-inner ag-hero-split">
            <div className="ag-hero-copy">
              <span className="ag-badge">{c.hero.badge}</span>
              <h1 className="ag-title" id="ag-hero-title">
                {c.hero.titleBefore}
                <span className="gold">{c.hero.titleHighlight}</span>
              </h1>
              <p className="ag-sub">{c.hero.subtitle}</p>
              <div className="ag-actions">
                <a
                  className="ag-btn ag-btn-gold"
                  href={wa(c.hero.cta1Message)}
                  target="_blank"
                  rel="noopener"
                >
                  {c.hero.cta1Text} <span aria-hidden="true">→</span>
                </a>
                <a className="ag-btn ag-btn-ghost" href="#pricing">
                  {c.hero.cta2Text}
                </a>
              </div>
              <p className="ag-meta">{c.hero.metaLine}</p>
            </div>
            <div className="ag-hero-media">
              <img
                src="/images/hero-3d/hero-3d-1.webp"
                alt="3D illustration of SEO analytics dashboard with rising rankings"
                width="560"
                height="373"
                className="ag-hero-img"
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        {/* LATEST ARTICLES — fresh guides right below the hero */}
        {latestPosts.length > 0 && (
          <section
            className="ag-sec ag-sec-white"
            id="latest"
            aria-labelledby="latest-title"
          >
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
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 20,
                  marginTop: 36,
                }}
              >
                {latestPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 14,
                      overflow: "hidden",
                      textDecoration: "none",
                      color: "inherit",
                      background: "var(--paper-2)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {p.cover_image ? (
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: 168,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        style={{
                          width: "100%",
                          height: 168,
                          background:
                            "linear-gradient(135deg, #0A1628 0%, #E63946 135%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "2.2rem",
                          color: "#fff",
                        }}
                      >
                        S
                      </div>
                    )}
                    <div
                      style={{
                        padding: 18,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: ".75rem",
                          color: "var(--faint)",
                        }}
                      >
                        {p.date}
                      </div>
                      <strong style={{ display: "block" }}>{p.title}</strong>
                      {p.excerpt && (
                        <span
                          style={{
                            fontSize: ".85rem",
                            color: "var(--muted)",
                            display: "block",
                          }}
                        >
                          {p.excerpt.length > 120
                            ? p.excerpt.slice(0, 120) + "…"
                            : p.excerpt}
                        </span>
                      )}
                      <span
                        style={{
                          marginTop: "auto",
                          paddingTop: 10,
                          fontSize: ".88rem",
                          fontWeight: 700,
                          color: "var(--gold)",
                        }}
                      >
                        Read more →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <a
                  href="/blog"
                  style={{
                    fontSize: ".92rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                  }}
                >
                  All articles →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* STATS */}
        <section className="ag-sec ag-sec-dark" aria-label="SEORankGulf at a glance" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div className="wrap">
            <div className="ag-stats">
              {c.stats.map((st, i) => (
                <div className="ag-stat" key={i}>
                  <strong>{st.value}</strong>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="ag-sec ag-sec-white" id="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">{c.servicesHeader.kicker}</div>
              <h2 className="display" id="services-title">
                {c.servicesHeader.title}
              </h2>
              <p className="section-intro">{c.servicesHeader.intro}</p>
            </div>
            <div className="ag-cards">
              {c.services.map((s, i) => (
                <a className="ag-card" key={i} href={s.link || "#services"} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div className="num">{String(i + 1).padStart(2, "0")}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <p className="tag">{s.tag}</p>
                  <span style={{ fontWeight: 700, color: "var(--gold)" }}>Learn more →</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="ag-sec ag-sec-light" id="process" aria-labelledby="process-title">
          <div className="wrap">
            <div className="ag-head">
              <div className="kicker">{c.processHeader.kicker}</div>
              <h2 className="display" id="process-title">
                {c.processHeader.title}
              </h2>
              <p className="section-intro">{c.processHeader.intro}</p>
            </div>
            <div className="ag-process">
              {c.process.map((p, i) => (
                <div className="ag-step" key={i}>
                  <small>STEP {String(i + 1).padStart(2, "0")}</small>
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
              <div className="kicker">{c.whyHeader.kicker}</div>
              <h2 className="display" id="why-title">
                {c.whyHeader.title}
              </h2>
              <p className="section-intro">{c.whyHeader.intro}</p>
            </div>
            <div className="ag-cards">
              {c.why.map((w, i) => (
                <div className="ag-card" key={i}>
                  <div className="num">{String(i + 1).padStart(2, "0")}</div>
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
              <div className="kicker">{c.resultsHeader.kicker}</div>
              <h2 className="display" id="results-title">
                {c.resultsHeader.title}
              </h2>
              <p className="section-intro">{c.resultsHeader.intro}</p>
            </div>
            <div className="ag-results">
              {c.results.map((r, i) => (
                <div className="ag-result" key={i}>
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
              <div className="kicker">{c.pricingHeader.kicker}</div>
              <h2 className="display" id="pricing-title">
                {c.pricingHeader.title}
              </h2>
              <p className="section-intro">{c.pricingHeader.intro}</p>
            </div>
            <div className="price-cards">
              {c.pricing.map((p) => (
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
                    href={wa(`Hi! I'm interested in the ${p.name} plan (${p.price}${p.period}).`)}
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
              <div className="kicker">{c.testimonialsHeader.kicker}</div>
              <h2 className="display" id="testimonials-title">
                {c.testimonialsHeader.title}
              </h2>
              <p className="section-intro">{c.testimonialsHeader.intro}</p>
            </div>
            <div className="ag-testis">
              {c.testimonials.map((t, i) => (
                <div className="ag-testi" key={i}>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <strong>{t.name}</strong>
                  <span className="role">{t.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ag-sec ag-sec-white" id="faq" aria-labelledby="faq-title">
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div className="ag-head">
              <div className="kicker">{c.faqHeader.kicker}</div>
              <h2 className="display" id="faq-title">
                {c.faqHeader.title}
              </h2>
            </div>
            <div className="faq" style={{ marginTop: 36 }}>
              {c.faqs.map((f) => (
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
            <div className="kicker">{c.contact.kicker}</div>
            <h2 className="display" id="contact-title">
              {c.contact.title}
            </h2>
            <p className="contact-sub">{c.contact.sub}</p>
            <a
              className="ag-btn ag-btn-gold"
              style={{ display: "inline-block", textDecoration: "none" }}
              href={wa(c.contact.ctaMessage)}
              target="_blank"
              rel="noopener"
            >
              {c.contact.ctaText} <span aria-hidden="true">→</span>
            </a>
            <p className="contact-note">{c.contact.note}</p>
          </div>
        </section>
      </main>

      <footer className="ag-footer">
        <div className="wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top" aria-label="SEORankGulf home">
                <span className="brand-mark"><LogoMark /></span>SEORANKGULF
              </a>
              <p className="ag-footer-tag">{c.footer.tagline}</p>
            </div>
            <div className="foot-col">
              <h4>Explore</h4>
              <a href="/seo-services">SEO Services</a>
              <a href="/local-seo">Local SEO</a>
              <a href="/technical-seo">Technical SEO</a>
              <a href="/seo-audit">Free SEO Audit</a>
              <a href="/blog">Blog</a>
              <a href="/about">About</a>
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
              <a href="/contact">Contact page</a>
              <a
                href={wa("Hi! I have a question about SEORankGulf.")}
                target="_blank"
                rel="noopener"
                style={{ fontSize: ".85rem" }}
              >
                WhatsApp: {waDisplay}
              </a>
              <p className="ag-footer-note">
                {c.footer.hours}
              </p>
            </div>
          </div>
          <div className="ag-offices">
            {c.footer.offices.map((o, i) => (
              <div className="ag-office" key={i}>
                <h5>{o.city}</h5>
                <p>{o.text}</p>
              </div>
            ))}
          </div>
          <div className="foot-base">
            <span>{c.footer.copyright}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
