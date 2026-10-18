import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/delete — delete a lead or booking.
 * Body: { type: "lead" | "booking", id: string }
 * Admin-only: proxy.ts already redirects non-admins away from /admin/*,
 * and we re-check the role here for safety.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  let body: { type?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const table = body.type === "lead" ? "leads" : body.type === "booking" ? "bookings" : null;
  const id = typeof body.id === "string" && body.id.length > 0 ? body.id : null;
  if (!table || !id) {
    return NextResponse.json({ error: "Need type (lead|booking) and id." }, { status: 400 });
  }

  // count:"exact" guards against silent RLS no-ops: without a delete policy,
  // Supabase returns success with 0 rows deleted and the row "comes back".
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error || count === 0) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
