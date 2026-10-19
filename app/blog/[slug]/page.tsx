import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import {
  MidArticleCTA,
  EndOfArticleCTA,
  LeadMagnetForm,
  WhatsAppFloat,
  type CtaContext,
} from "@/components/BlogCTA";
import { safeJsonLd } from "@/lib/json-ld";
import { getPublishedPosts, getPostBySlug, type Block } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}


export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found — SEORankGulf" };
  return {
    title: `${post.title} | SEORankGulf Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://seorankgulf.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: (() => {
        const firstImg = (post.content || []).find((b) => b.type === "img");
        if (firstImg && firstImg.type === "img") {
          const src = firstImg.src.startsWith("http")
            ? firstImg.src
            : `https://seorankgulf.com${firstImg.src}`;
          return [{ url: src, alt: firstImg.alt || post.title }];
        }
        return [];
      })(),
    },
  };
}

/** Render paragraph/list text with [label](url) converted to real links.
 * SEC-006 fix (2026-10-16): allowlist href protocols to block javascript: URLs. */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const href = m[2];
      // Only allow safe protocols — drop anything else (e.g. javascript:)
      if (!/^(https?:\/\/|\/|#|mailto:)/.test(href)) {
        return <span key={`${keyPrefix}-${j}`}>{m[1]}</span>;
      }
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={`${keyPrefix}-${j}`}
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {m[1]}
        </a>
      );
    }
    return <span key={`${keyPrefix}-${j}`}>{part}</span>;
  });
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i}>{block.text}</h2>;
    case "h3":
      return <h3 key={i}>{block.text}</h3>;
    case "ul":
      return (
        <ul key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `ul${i}`)}</li>
          ))}
        </ul>
      );
    case "quick-answer":
      return (
        <div
          key={i}
          className="quick-answer-box"
          style={{
            background: "rgba(216, 189, 143, 0.08)",
            border: "1px solid rgba(216, 189, 143, 0.35)",
            borderLeft: "4px solid var(--gold-soft)",
            borderRadius: 10,
            padding: "18px 22px",
            margin: "28px 0",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            <span style={{ color: "var(--gold-soft)" }}>
              Quick answer:{" "}
            </span>
            {renderInline(block.text, `qa${i}`)}
          </p>
        </div>
      );
    case "img":
      return (
        <figure key={i} style={{ margin: "32px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 12,
              display: "block",
            }}
            loading="lazy"
          />
          {block.caption && (
            <figcaption
              style={{
                marginTop: 10,
                fontSize: ".9rem",
                color: "#8b98b8",
                textAlign: "center",
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "video":
      return (
        <figure key={i} style={{ margin: "32px 0" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={block.src}
            poster={block.poster}
            controls
            preload="metadata"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 12,
              display: "block",
            }}
          />
          {block.caption && (
            <figcaption
              style={{
                marginTop: 10,
                fontSize: ".9rem",
                color: "#8b98b8",
                textAlign: "center",
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return <p key={i}>{renderInline(block.text, `p${i}`)}</p>;
  }
}

/** Derive the article's niche (e.g. "clothing boutiques") from its slug. */
function nicheFromSlug(slug: string): string {
  const prefixes = [
    "instagram-dm-automation-",
    "whatsapp-automation-",
    "ai-chatbots-",
    "ai-chatbot-",
  ];
  for (const p of prefixes) {
    if (slug.startsWith(p)) {
      const rest = slug.slice(p.length).replace(/-/g, " ").trim();
      if (rest) return rest;
    }
  }
  // Guide-style slugs: "ecommerce-store-assistants" -> "ecommerce stores"
  if (slug.endsWith("-assistants")) {
    return slug.slice(0, -"-assistants".length).replace(/-/g, " ").trim();
  }
  // Generic guides aren't niche-specific — "your business" reads naturally.
  return "your business";
}

/** Derive the automation channel (e.g. "WhatsApp automation") from the slug. */
function channelFromSlug(slug: string): string {
  if (slug.startsWith("whatsapp-automation-")) return "WhatsApp automation";
  if (slug.startsWith("instagram")) return "Instagram DM automation";
  if (slug.startsWith("ai-chatbot")) return "AI chatbot";
  if (slug.includes("whatsapp")) return "WhatsApp automation";
  if (slug.includes("chatbot")) return "AI chatbot";
  // Phone receptionist is a category guide, NOT a SEORankGulf offer —
  // never let the article CTA imply SEORankGulf builds phone agents.
  // (See the qualifier paragraph in the phone-receptionist article.)
  if (slug.includes("phone")) return "SEO guide";
  return "SEO guide";
}

/** /blog/[slug] — full article page. */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const ctx: CtaContext = {
    niche: nicheFromSlug(post.slug),
    channel: channelFromSlug(post.slug),
  };

  const all = await getPublishedPosts();
  // "Keep reading": topically related first (shared keywords + shared slug
  // words), newest first as tiebreak — so pending articles get inbound
  // links from their topical neighbours instead of only from /blog.
  const STOP = new Set([
    "ai", "chatbot", "chatbots", "automation", "whatsapp", "instagram",
    "dm", "for", "and", "the", "small", "business",
  ]);
  const slugWords = (s: string) =>
    new Set(s.split("-").filter((w) => w && !STOP.has(w)));
  const myWords = slugWords(post.slug);
  const myKeywords = new Set(post.keywords.map((k) => k.toLowerCase()));
  const related = all
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const words = slugWords(p.slug);
      let sharedWords = 0;
      for (const w of words) if (myWords.has(w)) sharedWords++;
      const sharedKeywords = p.keywords.filter((k) =>
        myKeywords.has(k.toLowerCase())
      ).length;
      return { p, score: sharedKeywords * 3 + sharedWords };
    })
    .sort((a, b) =>
      b.score - a.score !== 0
        ? b.score - a.score
        : b.p.created_at < a.p.created_at
          ? -1
          : b.p.created_at > a.p.created_at
            ? 1
            : 0
    )
    .slice(0, 3)
    .map(({ p }) => p);

  // Mid-article CTA position: ~40% into the body, never inside the FAQ section.
  const blocks = post.content || [];
  const faqHeadingIdx = blocks.findIndex(
    (b) => (b.type === "h2" || b.type === "h3") && /frequently asked questions/i.test(b.text)
  );
  const midCtaIdx = (() => {
    let idx = Math.max(4, Math.floor(blocks.length * 0.4));
    if (faqHeadingIdx > 0 && idx >= faqHeadingIdx) {
      idx = Math.max(4, faqHeadingIdx - 1);
    }
    return idx;
  })();

  // Article schema — Neil Patel 2026 rule: schema markup so AI can scrape and cite content
  const postImage = (() => {
    const imgBlock = (post.content || []).find((b) => b.type === "img");
    if (!imgBlock || imgBlock.type !== "img") return undefined;
    const src = imgBlock.src;
    return src.startsWith("http") ? src : `https://seorankgulf.com${src}`;
  })();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `https://seorankgulf.com/blog/${post.slug}`,
    // ISO 8601 datetime (was: display date like "13 October 2026").
    datePublished: post.created_at || post.date,
    ...(postImage ? { image: postImage } : {}),
    author: {
      "@type": "Organization",
      name: "SEORankGulf",
      url: "https://seorankgulf.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SEORankGulf",
      url: "https://seorankgulf.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://seorankgulf.com/blog/${post.slug}`,
    },
  };

  // BreadcrumbList schema — site-wide breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://seorankgulf.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://seorankgulf.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://seorankgulf.com/blog/${post.slug}`,
      },
    ],
  };

  // FAQ schema — extract Q&A pairs from FAQ section for Google rich snippets.
  // Robust: every h3 inside the FAQ section is a question, with or without
  // a trailing "?" (5 articles have FAQ headings without "?"), and the
  // answer is ALL consecutive <p> blocks until the next heading/block.
  // The old extractor silently dropped questions that lacked "?" or whose
  // answer spanned more than one paragraph.
  const faqSchema = (() => {
    const blocks = post.content || [];
    const faqIdx = blocks.findIndex(
      (b) => (b.type === "h2" || b.type === "h3") && /frequently asked questions/i.test(b.text)
    );
    if (faqIdx === -1) return null;
    const questions: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[] = [];
    for (let i = faqIdx + 1; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "h2") break; // FAQ section ended
      if (b.type === "h3") {
        const answerParts: string[] = [];
        for (let j = i + 1; j < blocks.length; j++) {
          const ab = blocks[j];
          if (ab.type === "p") answerParts.push(ab.text.trim());
          else break; // next heading / list / media ends this answer
        }
        if (answerParts.length) {
          questions.push({
            "@type": "Question",
            name: b.text.trim(),
            acceptedAnswer: { "@type": "Answer", text: answerParts.join("\n\n") },
          });
        }
      }
    }
    if (!questions.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions,
    };
  })();

  // SpeakableSpecification schema — flags quotable sections for voice assistants and AI answer engines
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: post.title,
    url: `https://seorankgulf.com/blog/${post.slug}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".quick-answer-box", ".article-body > p:first-of-type"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(speakableSchema) }}
      />
      <PageHeader />
      <main>
        <section className="article-hero">
          <div
            className="wrap hero-inner"
            style={{ paddingTop: 64, paddingBottom: 48, maxWidth: 860 }}
          >
            <Link
              href="/blog"
              style={{
                color: "var(--gold-soft)",
                fontWeight: 700,
                fontSize: ".9rem",
                textDecoration: "none",
              }}
            >
              ← All articles
            </Link>
            <h1
              className="hero-statement"
              style={{
                fontSize: "clamp(2rem,5vw,3.4rem)",
                marginTop: 20,
              }}
            >
              {post.title}
            </h1>
            <div
              className="blog-meta"
              style={{ color: "#b9c6e2", marginTop: 16 }}
            >
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </section>

        {post.cover_image && (
          <section className="block" style={{ paddingTop: 0, paddingBottom: 0 }}>
            <div className="wrap" style={{ maxWidth: 860 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 16,
                  display: "block",
                }}
              />
            </div>
          </section>
        )}

        <section className="block" style={{ paddingTop: 56 }}>
          <div className="wrap" style={{ maxWidth: 760 }}>
            <article className="article-body">
              {blocks.map((b, i) => (
                <Fragment key={i}>
                  {renderBlock(b, i)}
                  {i === midCtaIdx && <MidArticleCTA ctx={ctx} />}
                </Fragment>
              ))}
            </article>

            <EndOfArticleCTA ctx={ctx} />
            <LeadMagnetForm ctx={ctx} />
            <WhatsAppFloat ctx={ctx} />

            {related.length > 0 && (
              <div style={{ marginTop: 64 }}>
                <h2
                  className="display"
                  style={{ fontSize: "1.8rem", marginBottom: 24 }}
                >
                  Keep reading
                </h2>
                <div className="blog-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="blog-card"
                      style={{ padding: "24px 22px" }}
                    >
                      <h3 style={{ fontSize: "1.05rem" }}>{r.title}</h3>
                      <div className="blog-meta">
                        <span>{r.readTime}</span>
                      </div>
                      <span className="blog-read">Read →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
