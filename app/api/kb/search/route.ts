import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/kb/search — semantic search over the client's knowledge base.
 * Body: { query: string, count?: number }
 * Returns the most similar chunks with similarity scores.
 */
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`kb-search:${clientIp(req)}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!client) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const { query, count } = await req.json();
    if (!query?.trim() || query.length > 1000) {
      return NextResponse.json({ error: "Query required (max 1000 chars)." }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Search unavailable (AI not configured)." }, { status: 503 });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: query.trim().slice(0, 1000),
    });

    const { data, error } = await supabase.rpc("match_kb_documents", {
      query_embedding: embedding,
      match_client_id: client.id,
      match_count: Math.min(Math.max(Number(count) || 5, 1), 20),
    });
    if (error) throw error;

    return NextResponse.json({ results: data || [] });
  } catch (e) {
    console.error("kb search error:", e);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
