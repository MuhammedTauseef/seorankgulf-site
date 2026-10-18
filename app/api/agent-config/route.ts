import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getOwnClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: client } = await supabase
    .from("clients")
    .select("id, agent_config, agent_status")
    .eq("user_id", user.id)
    .single();
  if (!client) return { error: "No client profile.", status: 404 } as const;
  return { supabase, client } as const;
}

/** GET /api/agent-config — get own agent config (authenticated owner only). */
export async function GET() {
  const auth = await getOwnClient();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({
    agent_config: (auth.client as { agent_config?: unknown }).agent_config || {},
    agent_status: (auth.client as { agent_status?: string }).agent_status || "draft",
  });
}

/** PATCH /api/agent-config — update own agent config (authenticated owner only).
 * Allowed keys: agent_name, greeting, tone, language, business_hours, auto_reply.
 * agent_status can only move draft→preview→ready (never directly to live/building).
 */
const ALLOWED_KEYS = ["agent_name", "greeting", "tone", "language", "business_hours", "auto_reply"] as const;
const ALLOWED_TONES = ["friendly", "professional", "playful", "formal"];
const ALLOWED_STATUS = ["draft", "preview", "ready"];

export async function PATCH(req: NextRequest) {
  const auth = await getOwnClient();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const current = ((auth.client as { agent_config?: Record<string, unknown> }).agent_config || {});
  const next: Record<string, unknown> = { ...current };

  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      const val = String(body[key]).trim().slice(0, 1000);
      if (key === "tone" && !ALLOWED_TONES.includes(val.toLowerCase())) {
        return NextResponse.json(
          { error: `tone must be one of: ${ALLOWED_TONES.join(", ")}` },
          { status: 400 }
        );
      }
      next[key] = val;
    }
  }

  const updates: Record<string, unknown> = {
    agent_config: next,
    updated_at: new Date().toISOString(),
  };

  // Status transitions: only forward within draft→preview→ready.
  if (body.agent_status !== undefined) {
    const target = String(body.agent_status);
    const order = ["draft", "preview", "ready"];
    const currentStatus = (auth.client as { agent_status?: string }).agent_status || "draft";
    if (!ALLOWED_STATUS.includes(target)) {
      return NextResponse.json({ error: "Invalid agent_status." }, { status: 400 });
    }
    if (order.indexOf(target) < order.indexOf(currentStatus)) {
      return NextResponse.json({ error: "Cannot move agent status backwards." }, { status: 400 });
    }
    updates.agent_status = target;
  }

  const { error } = await auth.supabase
    .from("clients")
    .update(updates)
    .eq("id", (auth.client as { id: string }).id);

  if (error) {
    console.error("[agent-config] update failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Failed to save configuration." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, agent_config: next, agent_status: updates.agent_status });
}
