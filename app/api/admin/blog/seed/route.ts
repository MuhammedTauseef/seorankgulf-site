import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { posts } from "@/app/blog/posts";

// NOTE (2026-10-16 security audit): The old SEED_TOKEN bypass was removed.
// Admin session is now the only way to call this endpoint.

/**
 * POST /api/admin/blog/seed — one-time migration of the 11 hardcoded
 * articles into the blog_posts table. Admin only. Idempotent.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";

  if (!isAdmin) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let inserted = 0;
  const errors: string[] = [];

  for (const p of posts) {
    const { error } = await supabase.from("blog_posts").upsert(
      {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        keywords: p.keywords,
        published: true,
      },
      { onConflict: "slug" }
    );
    if (error) {
      errors.push(`${p.slug}: ${error.message}`);
    } else {
      inserted++;
    }
  }

  // Count actual rows to report truthfully
  const { count } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true });

  // Clean up the connectivity test row if present
  await supabase.from("blog_posts").delete().eq("slug", "seed-test");

  const { count: finalCount } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    ok: errors.length === 0,
    attempted: posts.length,
    inserted,
    totalInDb: finalCount,
    errors: errors.length ? errors : undefined,
  });
}
