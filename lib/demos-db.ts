import { createPublicClient } from "@/lib/supabase/public";
import type { DemoPersona } from "@/lib/demos";
import { DEMOS as FALLBACK_DEMOS } from "@/lib/demos";

/** Published demos from DB, in sort order. Falls back to hardcoded list if DB is empty/unavailable. */
export async function getPublishedDemos(): Promise<DemoPersona[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return FALLBACK_DEMOS;
    const { data, error } = await supabase
      .from("demos")
      .select("tag, name, slug, text, group_name, business, blurb, welcome")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return FALLBACK_DEMOS;
    return data.map((d) => ({
      tag: d.tag,
      name: d.name,
      slug: d.slug,
      text: d.text,
      group: d.group_name as "website" | "whatsapp" | "instagram",
      business: d.business,
      blurb: d.blurb,
      welcome: d.welcome,
    }));
  } catch {
    return FALLBACK_DEMOS;
  }
}

/** Single demo by slug from DB, with fallback. */
export async function getDemoBySlugDb(slug: string): Promise<DemoPersona | null> {
  const demos = await getPublishedDemos();
  return demos.find((d) => d.slug === slug) ?? null;
}
