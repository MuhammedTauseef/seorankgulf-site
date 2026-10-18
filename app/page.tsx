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



export default async function Home() {
  const latestPosts = (await getPublishedPosts()).slice(0, 3);
  const c = await getSiteContent();
  const waNumber = await getWhatsappNumber();
  const waDisplay = await getWhatsappDisplay();
  const wa = (message: string) => whatsappLinkFor(waNumber, message);

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
              href={wa(c.hero.cta1Message)}
              target="_blank"
              rel="noopener"
            >
              {c.hero.cta1Text}
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
        </section>

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
                <div className="ag-card" key={i}>
                  <div className="num">{String(i + 1).padStart(2, "0")}</div>
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
                <span className="brand-mark">S</span>SEORANKGULF
              </a>
              <p className="ag-footer-tag">{c.footer.tagline}</p>
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
