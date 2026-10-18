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

/** GET /api/admin/demos/[id] — get single demo. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("demos")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ demo: data });
}

/** PUT /api/admin/demos/[id] — update single demo. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.tag === "string") updates.tag = body.tag.trim().slice(0, 100);
  if (typeof body.name === "string") updates.name = body.name.trim().slice(0, 200);
  if (typeof body.text === "string") updates.text = body.text.trim().slice(0, 500);
  if (typeof body.group === "string") updates.group = body.group;
  if (typeof body.business === "string") updates.business = body.business.trim().slice(0, 500);
  if (typeof body.blurb === "string") updates.blurb = body.blurb.trim();
  if (typeof body.welcome === "string") updates.welcome = body.welcome.trim().slice(0, 500);
  if (typeof body.published === "boolean") updates.published = body.published;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("demos").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/demos/[id] — delete single demo. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  const { error, count } = await auth.supabase
    .from("demos")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
