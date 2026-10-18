import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";

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
  return { supabase, user } as const;
}

const wrap = (body: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
  <div style="text-align: center; margin-bottom: 24px;">
    <strong style="font-size: 1.5rem; color: #1e3a5f;">SEORankGulf</strong>
  </div>
  ${body}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.85rem; color: #9ca3af; text-align: center;">
    SEORankGulf — SEO Services<br>
    <a href="https://seorankgulf.com" style="color: #f59e0b;">seorankgulf.com</a>
  </div>
</div>`;

/**
 * POST /api/admin/send-email — send a follow-up email to a user (admin only).
 * Body: { to, subject, message }
 * Uses Resend. Logs to email_log table.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const to = String(body.to || "").trim();
  const subject = String(body.subject || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: "Subject required." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service not configured." },
      { status: 500 }
    );
  }

  const from = process.env.RESEND_FROM || "SEORankGulf <hello@seorankgulf.com>";
  const html = wrap(
    `<div style="white-space: pre-wrap; line-height: 1.6;">${message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</div>`
  );

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const result = await res.json();

    // Log to email_log
    const service = getServiceClient();
    if (service) {
      await service.from("email_log").insert({
        recipient: to,
        template: "admin-followup",
        subject,
      });
    }

    if (!res.ok) {
      console.error("[send-email] Resend error:", result);
      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error("[send-email] error:", e);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
