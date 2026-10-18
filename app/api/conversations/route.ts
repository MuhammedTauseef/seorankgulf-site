import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/conversations — own chat transcripts, paginated (owner only).
 * Query: ?limit=20&offset=0 (max limit 50)
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "20", 10) || 20, 1), 50);
  const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0", 10) || 0, 0);

  // RLS enforces user_id = auth.uid(); the explicit filter is defense-in-depth.
  const { data, error, count } = await supabase
    .from("chat_transcripts")
    .select("id, persona_name, messages, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[conversations] load failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 });
  }

  return NextResponse.json({
    conversations: data || [],
    total: count || 0,
    limit,
    offset,
  });
}
