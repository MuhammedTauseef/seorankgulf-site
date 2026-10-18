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

/** GET /api/admin/settings — all settings + FAQs. */
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [{ data: settings }, { data: faqs }] = await Promise.all([
    auth.supabase.from("site_settings").select("*").order("key"),
    auth.supabase.from("faqs").select("*").order("sort_order").order("created_at"),
  ]);
  return NextResponse.json({ settings: settings || [], faqs: faqs || [] });
}

/** PUT /api/admin/settings — update settings + FAQs. */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Update settings
  const settings = body.settings as Record<string, string> | undefined;
  if (settings) {
    for (const [key, value] of Object.entries(settings)) {
      await auth.supabase
        .from("site_settings")
        .update({ value: String(value).slice(0, 2000) })
        .eq("key", key);
    }
  }

  // Replace FAQs (simple approach: delete all + re-insert)
  const faqs = body.faqs as Array<{ question: string; answer: string; published: boolean; sort_order: number }> | undefined;
  if (faqs) {
    await auth.supabase.from("faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const rows = faqs
      .filter((f) => f.question.trim() && f.answer.trim())
      .map((f, i) => ({
        question: f.question.trim().slice(0, 500),
        answer: f.answer.trim().slice(0, 2000),
        published: f.published !== false,
        sort_order: i,
      }));
    if (rows.length > 0) {
      const { error } = await auth.supabase.from("faqs").insert(rows);
      if (error) return NextResponse.json({ error: "FAQ save failed." }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
