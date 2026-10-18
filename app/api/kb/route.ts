import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { rateLimit, userKey } from "@/lib/rate-limit";

/** Generate a 768-dim embedding with Gemini (free tier). */
async function embedText(value: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: value.slice(0, 8000),
      abortSignal: controller.signal,
    });
    return embedding;
  } catch (e) {
    console.error("embedding error:", e instanceof Error ? e.message.slice(0, 200) : e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getClientId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  return data?.id || null;
}

/** List KB documents. */
export async function GET() {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const { data } = await supabase
      .from("kb_documents")
      .select("id, filename, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    return NextResponse.json({ documents: data || [] });
  } catch (e) {
    console.error("kb list error:", e);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

/** Add a KB document. Splits into chunks for better retrieval. */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    // Upload rate limit: 20 uploads per user per day (prevents quota burn).
    if (user && !rateLimit(userKey("kb-upload", user.id), 20, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Daily upload limit reached (20/day). Try again tomorrow." },
        { status: 429 }
      );
    }

    const { filename, content } = await req.json();
    if (!filename?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Filename and content required." }, { status: 400 });
    }

    // File type validation: only text-based documents allowed.
    // SEC-007 fix (2026-10-16): require a valid extension — no-extension filenames no longer bypass validation.
    const cleanName = filename.trim().slice(0, 200);
    const allowedExt = [".txt", ".md", ".pdf", ".doc", ".docx", ".csv"];
    const ext = cleanName.toLowerCase().slice(cleanName.lastIndexOf("."));
    if (!allowedExt.includes(ext)) {
      return NextResponse.json(
        { error: `File type not allowed. Use: ${allowedExt.join(", ")}` },
        { status: 400 }
      );
    }
    // Block path traversal / suspicious names
    if (/[<>:"|?*\x00-\x1f]/.test(cleanName) || cleanName.includes("..")) {
      return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    if (content.length > 50000) {
      return NextResponse.json({ error: "Document too large (max 50,000 characters)." }, { status: 400 });
    }

    const hash = createHash("sha256").update(content).digest("hex").slice(0, 32);

    // Simple chunking: split by paragraphs, max ~1500 chars per chunk
    const chunks: string[] = [];
    const paras = content.split(/\n\s*\n/);
    let current = "";
    for (const p of paras) {
      if ((current + "\n\n" + p).length > 1500 && current) {
        chunks.push(current.trim());
        current = p;
      } else {
        current = current ? current + "\n\n" + p : p;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    // Generate embeddings for semantic search (null when API key missing —
    // chunks still save and keyword matching keeps working).
    const embeddings = await Promise.all(chunks.map((c) => embedText(c)));

    const rows = chunks.map((chunk, i) => ({
      client_id: clientId,
      filename: chunks.length > 1 ? `${cleanName} (part ${i + 1})` : cleanName,
      content: chunk,
      content_hash: `${hash}-${i}`,
      embedding: embeddings[i],
    }));

    const { error } = await supabase.from("kb_documents").insert(rows);
    if (error) throw error;

    const withEmbeddings = embeddings.filter(Boolean).length;
    return NextResponse.json({ ok: true, chunks: rows.length, embeddings: withEmbeddings });
  } catch (e) {
    console.error("kb upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

/** Delete a KB document. */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const clientId = await getClientId(supabase);
    if (!clientId) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const { error } = await supabase
      .from("kb_documents")
      .delete()
      .eq("id", id)
      .eq("client_id", clientId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("kb delete error:", e);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
