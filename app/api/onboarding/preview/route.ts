import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Returns the client's generated agent config for preview. */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { data } = await supabase
      .from("clients")
      .select("agent_config, business_name, agent_status")
      .eq("user_id", user.id)
      .single();

    if (!data?.agent_config) {
      return NextResponse.json({ error: "No agent yet — complete onboarding first." }, { status: 404 });
    }
    return NextResponse.json({ agent_config: data.agent_config, agent_status: data.agent_status });
  } catch (e) {
    console.error("preview error:", e);
    return NextResponse.json({ error: "Could not load." }, { status: 500 });
  }
}
