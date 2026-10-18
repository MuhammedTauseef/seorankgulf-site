import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { getPublishedDemos } from "@/lib/demos-db";

const BASE = "https://replypilot-site.vercel.app";

/**
 * Public routes for search engines. Auth-gated pages stay out.
 *
 * Canonical consistency: every URL here must match the page's own
 * <link rel="canonical"> exactly — the homepage has NO trailing slash.
 * lastmod comes only from genuine modification dates (post updated_at /
 * created_at). Pages without a real date omit lastmod rather than
 * fabricating freshness.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts().catch(() => []);
  const demos = await getPublishedDemos().catch(() => []);
  const routes: { path: string; lastModified?: Date; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/demo", priority: 0.9 },
    { path: "/blog", priority: 0.9 },
    { path: "/videos", priority: 0.9 },
    ...posts.map((p) => ({
      path: `/blog/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at),
      priority: 0.5,
    })),
    ...demos.map((d) => ({
      path: `/demo/${d.slug}`,
      priority: 0.5,
    })),
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/faq", priority: 0.5 },
    { path: "/privacy", priority: 0.5 },
    { path: "/terms", priority: 0.5 },
    { path: "/disclaimer", priority: 0.5 },
  ];
  // Collect article images for image sitemap
  const postImages: Record<string, string[]> = {};
  for (const p of posts) {
    const imgs = (p.content || [])
      .filter((b: any) => b.type === "img" && b.src)
      .map((b: any) => `${BASE}${b.src}`);
    if (imgs.length) postImages[`/blog/${p.slug}`] = imgs;
  }

  return routes.map((r) => ({
    url: `${BASE}${r.path === "/" ? "" : r.path}`,
    ...(r.lastModified ? { lastModified: r.lastModified } : {}),
    changeFrequency: r.path === "/" ? "weekly" : "monthly",
    priority: r.priority,
    ...(postImages[r.path] ? { images: postImages[r.path] } : {}),
  }));
}
