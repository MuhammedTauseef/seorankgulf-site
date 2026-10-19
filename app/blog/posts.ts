/** Blog post data for /blog. Education-first, SEO-optimized articles. */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string; caption?: string }
  | { type: "video"; src: string; poster?: string; caption?: string }
  | { type: "quick-answer"; text: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  keywords: string[];
  content: Block[];
}


/** Deleted 2026-10-19: the 3 hardcoded starter articles were removed
 *  (written without keyword research). New research-based articles are
 *  published via the admin panel (database). */
export const posts: Post[] = [];
