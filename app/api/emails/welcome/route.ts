import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emails } from "@/lib/emails";
import { rateLimit, userKey } from "@/lib/rate-limit";

/**
 * POST /api/emails/welcome — send welcome email after signup.
 * Called by the frontend after successful signup.
 * Requires authentication (user can only send to themselves).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // Rate limit: 3 welcome emails per user per day (prevent abuse)
  const allowed = rateLimit(userKey("welcome", user.id), 3, 86400 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "there").slice(0, 100);
  const businessName = String(body.businessName || "your business").slice(0, 100);
  const email = user.email;
  if (!email) return NextResponse.json({ error: "No email on account." }, { status: 400 });

  try {
    await emails.welcome(email, name, businessName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[welcome-email] failed:", e);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
