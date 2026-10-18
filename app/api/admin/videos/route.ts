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

/** GET /api/admin/videos — list all (or single via /api/admin/videos/<id>). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.pathname.split("/").pop();
  if (id && id !== "videos") {
    const { data, error } = await auth.supabase.from("videos").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ video: data });
  }

  const { data, error } = await auth.supabase
    .from("videos")
    .select("id, file, niche, channel, title, published, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  return NextResponse.json({ videos: data });
}

/** POST /api/admin/videos — create. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const file = String(body.file ?? "").trim().slice(0, 500);
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!file || !title) {
    return NextResponse.json({ error: "Video file and title required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("videos")
    .insert({
      file,
      poster: String(body.poster ?? "").trim().slice(0, 500) || null,
      niche: String(body.niche ?? "").trim().slice(0, 100),
      channel: String(body.channel ?? "").trim().slice(0, 100),
      title,
      description: String(body.description ?? "").trim().slice(0, 2000),
      published: body.published !== false,
      sort_order: Number(body.sort_order) || 0,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "Create failed." }, { status: 400 });

  // Auto-deploy: new video goes live automatically
  triggerAutoDeploy(`video:${title}`).catch(() => {});

  return NextResponse.json({ ok: true, video: data });
}

/** PUT /api/admin/videos — update. */
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
  const file = String(body.file ?? "").trim().slice(0, 500);
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!id || !file || !title) {
    return NextResponse.json({ error: "ID, file and title required." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("videos")
    .update({
      file,
      poster: String(body.poster ?? "").trim().slice(0, 500) || null,
      niche: String(body.niche ?? "").trim().slice(0, 100),
      channel: String(body.channel ?? "").trim().slice(0, 100),
      title,
      description: String(body.description ?? "").trim().slice(0, 2000),
      published: body.published !== false,
      sort_order: Number(body.sort_order) || 0,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/videos?id=... */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  const { error, count } = await auth.supabase.from("videos").delete({ count: "exact" }).eq("id", id);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
