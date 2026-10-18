import { createPublicClient } from "@/lib/supabase/public";
import type { Block } from "@/lib/blog";

export interface StaticPage {
  slug: string;
  title: string;
  content: Block[];
}

/** Get a static page by slug from DB. Returns null if not found (caller uses hardcoded fallback). */
export async function getStaticPage(slug: string): Promise<StaticPage | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("pages")
      .select("slug, title, content")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (error || !data) return null;
    return {
      slug: data.slug,
      title: data.title,
      content: Array.isArray(data.content) ? data.content : [],
    };
  } catch {
    return null;
  }
}
