import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

/** GET /api/admin/pages — list all (or single via ?slug=). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const slug = new URL(req.url).searchParams.get("slug");
  if (slug) {
    const { data, error } = await auth.supabase.from("pages").select("*").eq("slug", slug).single();
    if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ page: data });
  }

  const { data, error } = await auth.supabase
    .from("pages")
    .select("slug, title, published, updated_at")
    .order("slug");
  if (error) return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  return NextResponse.json({ pages: data });
}

/** PUT /api/admin/pages — create or update a page. */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase().slice(0, 100);
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!slug || !title) {
    return NextResponse.json({ error: "Slug and title required." }, { status: 400 });
  }

  const content = Array.isArray(body.content) ? body.content : [];
  const { error } = await auth.supabase.from("pages").upsert(
    {
      slug,
      title,
      content,
      published: body.published !== false,
    },
    { onConflict: "slug" }
  );

  if (error) return NextResponse.json({ error: "Save failed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/pages?slug=... */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug required." }, { status: 400 });

  // Protect core pages from deletion
  const protectedSlugs = ["about", "contact", "faq", "privacy", "terms", "disclaimer"];
  if (protectedSlugs.includes(slug)) {
    return NextResponse.json({ error: "Core pages cannot be deleted (can be unpublished)." }, { status: 400 });
  }

  const { error, count } = await auth.supabase.from("pages").delete({ count: "exact" }).eq("slug", slug);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
