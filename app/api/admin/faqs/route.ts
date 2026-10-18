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
  return { supabase } as const;
}

/** GET /api/admin/faqs — list all FAQs including unpublished (admin only). */
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("faqs")
    .select("id, question, answer, published, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load FAQs." }, { status: 500 });
  }
  return NextResponse.json({ faqs: data || [] });
}

/** POST /api/admin/faqs — create FAQ (admin only). */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { question?: string; answer?: string; published?: boolean; sort_order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const question = (body.question || "").trim().slice(0, 500);
  const answer = (body.answer || "").trim().slice(0, 5000);
  if (!question || !answer) {
    return NextResponse.json({ error: "Question and answer required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("faqs")
    .insert({
      question,
      answer,
      published: body.published !== false,
      sort_order: Number.isInteger(body.sort_order) ? body.sort_order : 0,
    })
    .select("id, question, answer, published, sort_order")
    .single();

  if (error) {
    console.error("[admin/faqs] insert failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to create FAQ." }, { status: 500 });
  }
  return NextResponse.json({ faq: data }, { status: 201 });
}

/** PATCH /api/admin/faqs — update FAQ (admin only). */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { id?: string; question?: string; answer?: string; published?: boolean; sort_order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "FAQ id required." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.question !== undefined) {
    const q = body.question.trim().slice(0, 500);
    if (!q) return NextResponse.json({ error: "Question cannot be empty." }, { status: 400 });
    updates.question = q;
  }
  if (body.answer !== undefined) {
    const a = body.answer.trim().slice(0, 5000);
    if (!a) return NextResponse.json({ error: "Answer cannot be empty." }, { status: 400 });
    updates.answer = a;
  }
  if (body.published !== undefined) updates.published = !!body.published;
  if (body.sort_order !== undefined && Number.isInteger(body.sort_order)) {
    updates.sort_order = body.sort_order;
  }

  const { data, error } = await auth.supabase
    .from("faqs")
    .update(updates)
    .eq("id", body.id)
    .select("id, question, answer, published, sort_order")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update FAQ." }, { status: 500 });
  }
  return NextResponse.json({ faq: data });
}

/** DELETE /api/admin/faqs?id=xxx — delete FAQ (admin only). */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "FAQ id required." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("faqs").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete FAQ." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id });
}
