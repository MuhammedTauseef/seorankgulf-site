import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Dashboard data for the logged-in client. */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { data: client } = await supabase
      .from("clients")
      .select("business_name, industry, agent_status, subscription_status, id")
      .eq("user_id", user.id)
      .single();

    if (!client) return NextResponse.json({ error: "No client profile" }, { status: 404 });

    const { data: payments } = await supabase
      .from("payments")
      .select("amount_cents, type, status, paid_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Stats scoped to THIS client only:
    // - leads: submitted while signed in as this user
    // - bookings: made with this client's business (source = business_name)
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: bookingsCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("source", client.business_name);

    return NextResponse.json({
      business_name: client.business_name,
      industry: client.industry,
      agent_status: client.agent_status,
      subscription_status: client.subscription_status,
      stats: {
        chats: 0, // wired to chat analytics in a later step
        leads: leadsCount || 0,
        bookings: bookingsCount || 0,
      },
      payments: payments || [],
    });
  } catch (e) {
    console.error("dashboard error:", e);
    return NextResponse.json({ error: "Could not load dashboard." }, { status: 500 });
  }
}
