import { createPublicClient } from "@/lib/supabase/public";
import { posts as FALLBACK_POSTS } from "@/app/blog/posts";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string; caption?: string }
  | { type: "video"; src: string; poster?: string; caption: string }
  | { type: "quick-answer"; text: string };

export interface DbPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: Block[];
  keywords: string[];
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  /** Display date derived from created_at. */
  date: string;
  /** Estimated read time from content length. */
  readTime: string;
}

function enrich(row: Record<string, unknown>): DbPost {
  const content = Array.isArray(row.content) ? (row.content as Block[]) : [];
  const words = content
    .map((b) =>
      b.type === "ul"
        ? b.items.join(" ")
        : b.type === "img" || b.type === "video"
          ? ""
          : b.text
    )
    .join(" ")
    .split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 200));
  const created = String(row.created_at ?? "");
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    content,
    keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
    cover_image: (row.cover_image as string) || null,
    published: row.published !== false,
    created_at: created,
    updated_at: String(row.updated_at ?? ""),
    date: created
      ? new Date(created).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    readTime: `${mins} min read`,
  };
}

/** Convert hardcoded post to DbPost shape (build-time fallback). */
function fallbackToDbPost(p: (typeof FALLBACK_POSTS)[number], i: number): DbPost {
  // Derive created_at from the post's display date so merged listings sort newest-first.
  const parsed = Date.parse(p.date);
  const created = Number.isFinite(parsed)
    ? new Date(parsed).toISOString()
    : "2026-10-08T00:00:00.000Z";
  // Recompute read time from actual content (same formula as enrich).
  // The stored p.readTime values were systematically understated, so
  // never trust them — derive from word count instead.
  const words = (p.content as Block[])
    .map((b) =>
      b.type === "ul"
        ? b.items.join(" ")
        : b.type === "img" || b.type === "video"
          ? ""
          : b.text
    )
    .join(" ")
    .split(/\s+/).length;
  const mins = Math.max(2, Math.round(words / 200));
  return {
    id: `fallback-${i}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content as Block[],
    keywords: p.keywords,
    cover_image: null,
    published: true,
    created_at: created,
    updated_at: created,
    date: p.date,
    readTime: `${mins} min read`,
  };
}

/** All published posts, newest first (public read).
 *  Merges CMS rows with hardcoded posts: DB rows first, then any hardcoded
 *  post whose slug isn't already listed — so code-pushed articles always show
 *  even when the CMS table is non-empty. Falls back to hardcoded posts
 *  entirely when the DB is unavailable or empty. */
export async function getPublishedPosts(): Promise<DbPost[]> {
  let dbPosts: DbPost[] = [];
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      // For posts with placeholder/short DB content, substitute full fallback content
      dbPosts = data.map((p) => {
        const len = JSON.stringify((p as { content?: unknown }).content || "").length;
        if (len >= 500) return enrich(p);
        // Find matching fallback post by slug
        const fb = FALLBACK_POSTS.find((x) => x.slug === (p as { slug?: string }).slug);
        if (fb) return fallbackToDbPost(fb, FALLBACK_POSTS.indexOf(fb));
        return enrich(p);
      });
    }
  }
  // Merge in hardcoded posts missing from the DB (dedupe by slug), newest first.
  const seen = new Set(dbPosts.map((p) => p.slug));
  const extra = FALLBACK_POSTS.filter((p) => !seen.has(p.slug)).map((p, i) =>
    fallbackToDbPost(p, i)
  );
  const merged = [...dbPosts, ...extra];
  merged.sort((a, b) =>
    a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
  );
  return merged;
}

/** Single published post by slug (public read). */
export async function getPostBySlug(slug: string): Promise<DbPost | null> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (!error && data) {
      // If DB content is short/placeholder, use full fallback content
      const contentLen = JSON.stringify(data.content || "").length;
      if (contentLen >= 500) return enrich(data);
    }
  }
  // Fallback: hardcoded posts (full content)
  const p = FALLBACK_POSTS.find((x) => x.slug === slug);
  if (!p) return null;
  return fallbackToDbPost(p, FALLBACK_POSTS.indexOf(p));
}
