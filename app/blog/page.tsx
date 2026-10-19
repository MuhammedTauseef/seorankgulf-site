import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPublishedPosts } from "@/lib/blog";
import { safeJsonLd } from "@/lib/json-ld";

// Revalidate every 60 seconds — content changes in admin show without redeploy
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — SEO Guides for Gulf Businesses | SEORankGulf",
  description:
    "Practical, education-first SEO guides for Gulf businesses: local SEO, technical SEO, keyword research, Google Business Profile, and content that ranks.",
  keywords: [
    "SEO blog",
    "local SEO Dubai",
    "SEO guides UAE",
    "keyword research",
    "Google Business Profile",
    "SEORankGulf",
  ],
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/blog",
  },
  openGraph: {
    url: "https://seorankgulf-site.vercel.app/blog",
    images: [
      {
        url: "https://seorankgulf-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SEORankGulf — SEO Services for Gulf Businesses",
      },
    ],
  },
};

/** /blog — listing of all posts. */
export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SEORankGulf Blog",
    url: "https://seorankgulf-site.vercel.app/blog",
    description:
      "Practical SEO guides for Gulf business owners — no jargon, no hype, just what ranks.",
    inLanguage: "en",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogSchema) }}
      />
      <PageHeader />
      <main>
        <section className="hero" style={{ padding: 0 }}>
          <div
            className="wrap hero-inner"
            style={{ paddingTop: 72, paddingBottom: 56 }}
          >
            <span className="eyebrow">SEORankGulf Blog</span>
            <h1
              className="hero-statement"
              style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
            >
              SEO guides, explained simply<span className="dot">.</span>
            </h1>
            <p className="hero-sub" style={{ maxWidth: "38ch" }}>
              Practical SEO guides for Gulf business owners — no jargon, no hype,
              just what ranks.
            </p>
          </div>
        </section>

        <section className="block" style={{ paddingTop: 64 }}>
          <div className="wrap">
            {posts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 24px",
                  color: "var(--muted, #94a3b8)",
                }}
              >
                <p style={{ fontSize: "1.15rem", marginBottom: 8 }}>
                  No articles yet — fresh SEO guides are on the way.
                </p>
                <p style={{ fontSize: "0.95rem" }}>
                  Check back soon for practical, research-backed guides for Gulf
                  business owners.
                </p>
              </div>
            ) : (
            <div className="blog-grid">
              {posts.map((post, i) => {
                const imgBlock = post.content.find((b) => b.type === "img");
                const thumb =
                  (imgBlock && imgBlock.type === "img" ? imgBlock.src : null) ||
                  post.cover_image ||
                  null;
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="blog-card"
                  >
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={post.title}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginBottom: 16,
                          display: "block",
                        }}
                        loading="lazy"
                      />
                    )}
                    <span className="service-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="blog-meta">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="blog-read">Read article →</span>
                  </Link>
                );
              })}
            </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
