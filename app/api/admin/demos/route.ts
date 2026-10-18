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

/** GET /api/admin/demos — list all (or single via /api/admin/demos/<id>). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.pathname.split("/").pop();
  if (id && id !== "demos") {
    const { data, error } = await auth.supabase.from("demos").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ demo: data });
  }

  const { data, error } = await auth.supabase
    .from("demos")
    .select("id, tag, name, slug, group_name, published, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  return NextResponse.json({ demos: data });
}

/** POST /api/admin/demos — create. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const slug = String(body.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 100);
  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug required." }, { status: 400 });
  }

  const group = String(body.group_name ?? "website");
  const { data, error } = await auth.supabase
    .from("demos")
    .insert({
      tag: String(body.tag ?? "").trim().slice(0, 100),
      name,
      slug,
      text: String(body.text ?? "").trim().slice(0, 500),
      group_name: ["website", "whatsapp", "instagram"].includes(group) ? group : "website",
      business: String(body.business ?? "").trim().slice(0, 500),
      blurb: String(body.blurb ?? "").trim().slice(0, 2000),
      welcome: String(body.welcome ?? "").trim().slice(0, 500),
      published: body.published !== false,
      sort_order: Number(body.sort_order) || 0,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "Create failed (slug may exist)." }, { status: 400 });
  return NextResponse.json({ ok: true, demo: data });
}

/** PUT /api/admin/demos — update. */
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
  const name = String(body.name ?? "").trim().slice(0, 200);
  if (!id || !name) {
    return NextResponse.json({ error: "ID and name required." }, { status: 400 });
  }

  const group = String(body.group_name ?? "website");
  const { error } = await auth.supabase
    .from("demos")
    .update({
      tag: String(body.tag ?? "").trim().slice(0, 100),
      name,
      text: String(body.text ?? "").trim().slice(0, 500),
      group_name: ["website", "whatsapp", "instagram"].includes(group) ? group : "website",
      business: String(body.business ?? "").trim().slice(0, 500),
      blurb: String(body.blurb ?? "").trim().slice(0, 2000),
      welcome: String(body.welcome ?? "").trim().slice(0, 500),
      published: body.published !== false,
      sort_order: Number(body.sort_order) || 0,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/demos?id=... */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  const { error, count } = await auth.supabase.from("demos").delete({ count: "exact" }).eq("id", id);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
