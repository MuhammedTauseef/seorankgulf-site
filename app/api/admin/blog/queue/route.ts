import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSupabaseQueueMutationStore,
  deleteQueuedItem,
  slugifyQueueSlug,
  updateQueuedItem,
} from "@/lib/buffer-queue";

/**
 * Buffer queue admin API — how finished articles enter the buffer.
 *
 * POST   /api/admin/blog/queue — enqueue a complete article payload with
 *        a publish_at date. The article does NOT enter blog_posts here;
 *        the auto-publisher later creates it via POST /api/admin/blog
 *        (the panel's own publish action) when the date comes due.
 * GET    /api/admin/blog/queue — list queue rows (status readout).
 * GET    /api/admin/blog/queue?id=... — one full queue row (for editing).
 * PUT    /api/admin/blog/queue — edit / reschedule a QUEUED row
 *        (title, slug, excerpt, content, keywords, cover_image,
 *        publish_at). Only status 'queued' may be changed — enforced
 *        in lib/buffer-queue.ts by status check + conditional write.
 * DELETE /api/admin/blog/queue?id=... — remove a still-queued row.
 *
 * Admin session required, same requireAdmin pattern as /api/admin/blog.
 */

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
  return slugifyQueueSlug(s);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Single full row for the buffer edit page: /api/admin/blog/queue?id=...
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const { data, error } = await auth.supabase
      .from("blog_buffer_queue")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Failed to load queue item." }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Queue item not found." }, { status: 404 });
    return NextResponse.json({ item: data });
  }

  const { data, error } = await auth.supabase
    .from("blog_buffer_queue")
    .select(
      "id, slug, title, publish_at, status, attempts, last_error, published_post_id, created_at, updated_at"
    )
    .order("publish_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Failed to load queue." }, { status: 500 });
  return NextResponse.json({ queue: data });
}

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
  if (content.length === 0) {
    return NextResponse.json({ error: "Content required." }, { status: 400 });
  }

  const publishAtRaw = String(body.publish_at ?? "").trim();
  const publishAt = publishAtRaw ? new Date(publishAtRaw) : null;
  if (!publishAt || Number.isNaN(publishAt.getTime())) {
    return NextResponse.json(
      { error: "publish_at (ISO date) required." },
      { status: 400 }
    );
  }

  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((k) => String(k).slice(0, 60)).slice(0, 10)
    : [];

  const { data, error } = await auth.supabase
    .from("blog_buffer_queue")
    .insert({
      slug,
      title,
      excerpt: String(body.excerpt ?? "").trim().slice(0, 500),
      content,
      keywords,
      cover_image: String(body.cover_image ?? "").trim().slice(0, 500) || null,
      publish_at: publishAt.toISOString(),
      status: "queued",
    })
    .select("id, slug, publish_at")
    .single();

  if (error) {
    const msg =
      error.code === "23505"
        ? "An article with this slug is already in the queue."
        : "Enqueue failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true, queued: data });
}

/** PUT /api/admin/blog/queue — edit / reschedule a QUEUED row only. */
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

  const store = createSupabaseQueueMutationStore(auth.supabase);
  const result = await updateQueuedItem(store, id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const item = await store.getById(id);
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  // Only still-queued rows may be removed — publishing/published/failed
  // rows are the audit trail and stay. Enforced by status check +
  // conditional delete in lib/buffer-queue.ts.
  const store = createSupabaseQueueMutationStore(auth.supabase);
  const result = await deleteQueuedItem(store, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
