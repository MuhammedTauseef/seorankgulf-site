import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerAutoDeploy } from "@/lib/auto-deploy";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return { error: "Admins only.", status: 403 } as const;
  }
  return { supabase };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** GET /api/admin/blog — list all posts (including drafts). */
/** GET /api/admin/blog/[id] — single post for editing. */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Single post: /api/admin/blog/<id>
  const id = req.nextUrl.pathname.split("/").pop();
  if (id && id !== "blog") {
    const { data, error } = await auth.supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ post: data });
  }

  const { data, error } = await auth.supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, published, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  return NextResponse.json({ posts: data });
}

/** POST /api/admin/blog — create a post. Body: { title, slug?, excerpt, content, keywords, cover_image?, published } */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });
  const slug = slugify(String(body.slug ?? "") || title);
  if (!slug) return NextResponse.json({ error: "Invalid slug." }, { status: 400 });

  const content = Array.isArray(body.content) ? body.content.slice(0, 200) : [];
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((k) => String(k).slice(0, 60)).slice(0, 10)
    : [];

  const { data, error } = await auth.supabase
    .from("blog_posts")
    .insert({
      slug,
      title,
      excerpt: String(body.excerpt ?? "").trim().slice(0, 500),
      content,
      keywords,
      cover_image: String(body.cover_image ?? "").trim().slice(0, 500) || null,
      published: body.published !== false,
    })
    .select("id, slug")
    .single();

  if (error) {
    const msg = error.code === "23505" ? "A post with this slug already exists." : "Create failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Auto-deploy: new blog post goes live automatically
  triggerAutoDeploy(`blog:${slug}`).catch(() => {});

  return NextResponse.json({ ok: true, post: data });
}

/** PUT /api/admin/blog — update a post. Body: { id, title, slug?, excerpt, content, keywords, cover_image?, published } */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });
  const slug = slugify(String(body.slug ?? "") || title);

  const content = Array.isArray(body.content) ? body.content.slice(0, 200) : [];
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((k) => String(k).slice(0, 60)).slice(0, 10)
    : [];

  const { error } = await auth.supabase
    .from("blog_posts")
    .update({
      slug,
      title,
      excerpt: String(body.excerpt ?? "").trim().slice(0, 500),
      content,
      keywords,
      cover_image: String(body.cover_image ?? "").trim().slice(0, 500) || null,
      published: body.published !== false,
    })
    .eq("id", id);

  if (error) {
    const msg = error.code === "23505" ? "A post with this slug already exists." : "Update failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/blog?id=... — delete a post. */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  const { error, count } = await auth.supabase
    .from("blog_posts")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
