import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Whop webhook receiver — payment verification with zero compromise.
 *
 * Security:
 * - Every request is signature-verified using the Standard Webhooks spec
 *   (HMAC-SHA256 over "{webhook-id}.{webhook-timestamp}.{raw_body}").
 * - Replay protection: events older than 5 minutes are rejected.
 * - Idempotency: webhook-id is stored; duplicates are acknowledged but not reprocessed.
 * - Service-role client is used ONLY here (server-side), never exposed.
 *
 * Setup:
 * 1. Whop Dashboard → Developer → Webhooks → Create webhook
 *    URL: https://seorankgulf.com/api/webhooks/whop
 *    Events: payment.succeeded, payment.failed, membership.activated,
 *            membership.deactivated, invoice.paid
 * 2. Copy the webhook secret → Vercel env var WHOP_WEBHOOK_SECRET
 */

const WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || "";
const REPLAY_TOLERANCE_MS = 5 * 60 * 1000;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

const ADMIN_EMAIL = "muhammadtauseef714@gmail.com";

const emailWrap = (body: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
  <div style="text-align: center; margin-bottom: 24px;">
    <strong style="font-size: 1.5rem; color: #1e3a5f;">SEORankGulf</strong>
  </div>
  ${body}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.85rem; color: #9ca3af; text-align: center;">
    SEORankGulf — AI Automation<br>
    <a href="https://seorankgulf.com" style="color: #f59e0b;">seorankgulf.com</a>
  </div>
</div>`;

/** Send an email via Resend. Fire-and-forget: never blocks the webhook. */
async function sendEmail(to: string, subject: string, htmlBody: string): Promise<{ status: "sent" | "dev-mode" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL:DEV-MODE] NOT SENT (no RESEND_API_KEY) | To: ${to} | Subject: ${subject}`);
    return { status: "dev-mode", detail: "No RESEND_API_KEY — logged, not sent." };
  }
  const from = process.env.RESEND_FROM || "SEORankGulf <hello@seorankgulf.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html: emailWrap(htmlBody) }),
    });
    if (res.ok) return { status: "sent" };
    const errBody = await res.text().catch(() => "");
    console.error("[webhook-email] Resend rejected:", res.status, errBody.slice(0, 200));
    return { status: "failed", detail: `Resend HTTP ${res.status}` };
  } catch (e) {
    console.error("[webhook-email] send failed:", e instanceof Error ? e.message : e);
    return { status: "failed", detail: "Network error" };
  }
}

function formatMoney(cents: number, currency: string): string {
  return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

const PLAN_LABELS: Record<string, string> = {
  build_deposit: "Build Deposit ($125)",
  build_go_live: "Go-Live Payment ($124)",
  care_plan: "Care Plan ($99/month)",
};

/**
 * Derive the HMAC key from the `ws_...` webhook signing secret.
 *
 * Whop signs webhooks with the LITERAL BYTES of the full secret string
 * (e.g. `ws_` + 64 hex chars), NOT a base64-decoded derivation.
 * Verified against Whop's official docs ("The key is your `ws_...` secret")
 * and the whopsdk-ruby/python signature-verification fixes (2026-08-22).
 */
function deriveKey(secret: string): Buffer {
  return Buffer.from(secret, "utf8");
}

function verifySignature(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string
): boolean {
  if (!WEBHOOK_SECRET) return false;
  try {
    const ts = Number(webhookTimestamp);
    if (!Number.isFinite(ts)) return false;
    // Whop sends seconds; tolerate both seconds and ms
    const tsMs = ts < 1e12 ? ts * 1000 : ts;
    if (Math.abs(Date.now() - tsMs) > REPLAY_TOLERANCE_MS) return false;

    const key = deriveKey(WEBHOOK_SECRET);
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", key)
      .update(signedContent, "utf8")
      .digest("base64");

    // Whop sends signatures as "v1,<base64>"
    const sigs = webhookSignature.split(" ").flatMap((s) => s.split(","));
    for (const sig of sigs) {
      const clean = sig.startsWith("v1,") ? sig.slice(3) : sig.startsWith("v1_") ? sig.slice(3) : sig;
      const a = Buffer.from(clean);
      const b = Buffer.from(expected);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Map a Whop plan/product to our internal payment type + plan key. */
function classifyProduct(productId: string | undefined, amountCents: number): {
  type: "upfront" | "go_live" | "monthly";
  planKey: string;
} {
  const id = (productId || "").toLowerCase();
  // $99 recurring = care plan (monthly)
  if (id.includes("care") || amountCents === 9900) {
    return { type: "monthly", planKey: "care_plan" };
  }
  // $125 one-time = deposit (upfront)
  if (id.includes("deposit") || id.includes("ff") || amountCents === 12500) {
    return { type: "upfront", planKey: "build_deposit" };
  }
  // $124 one-time = go-live
  return { type: "go_live", planKey: "build_go_live" };
}

async function findClientByEmail(supabase: any, email: string) {
  const { data } = await supabase
    .from("clients")
    .select("id, user_id, business_name, subscription_status")
    .eq("user_id", (
      // look up via a direct email match on auth.users is not possible with anon key;
      // we match clients whose linked auth user has this email via a best-effort query.
      // Fallback: match on nothing and leave client_id null for manual review.
      ""
    ));
  return data;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookId = request.headers.get("webhook-id") || "";
  const webhookTimestamp = request.headers.get("webhook-timestamp") || "";
  const webhookSignature = request.headers.get("webhook-signature") || "";

  // Fail fast: no secret configured → reject honestly (never 500).
  if (!WEBHOOK_SECRET) {
    console.error("[whop-webhook] WHOP_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  let event: any = null;
  let eventType = "unknown";
  try {
    event = JSON.parse(rawBody);
    eventType = event.type || event.action || "unknown";
  } catch {
    // invalid JSON — log and reject
  }

  const signatureValid =
    webhookId &&
    webhookTimestamp &&
    webhookSignature &&
    event !== null &&
    verifySignature(rawBody, webhookId, webhookTimestamp, webhookSignature);

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Always audit-log the delivery attempt
  try {
    await supabase.from("webhook_events").insert({
      provider: "whop",
      webhook_id: webhookId || `no-id-${Date.now()}`,
      event_type: eventType,
      payload: event || { raw: rawBody.slice(0, 2000) },
      signature_valid: !!signatureValid,
      processed: false,
    });
  } catch {
    // table may not exist yet — continue; signature was already verified above
  }

  // Idempotency: skip already-processed webhook IDs
  try {
    const { data: existing } = await supabase
      .from("webhook_events")
      .select("id, processed")
      .eq("provider", "whop")
      .eq("webhook_id", webhookId)
      .maybeSingle();
    if (existing?.processed) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  } catch {
    /* continue */
  }

  try {
    const data = event.data || {};
    const buyerEmail =
      data.user?.email || data.email || data.customer_email || null;
    const buyerName =
      data.user?.name || data.user?.username || data.name || null;
    const whopPaymentId =
      data.id || data.payment_id || data.invoice_id || webhookId;
    const amountCents = Math.round(Number(data.amount || data.total || 0));
    // Whop amounts are usually in dollars; normalize common shapes
    const normalizedCents =
      amountCents > 0 && amountCents < 1000 ? amountCents * 100 : amountCents;
    const currency = (data.currency || "usd").toLowerCase();
    const productId =
      data.product_id || data.plan_id || data.line_items?.[0]?.product_id;

    const markProcessed = async (error?: string) => {
      try {
        await supabase
          .from("webhook_events")
          .update({ processed: !error, error: error || null })
          .eq("provider", "whop")
          .eq("webhook_id", webhookId);
      } catch {
        /* ignore */
      }
    };

    // --- Match buyer email to a client (best effort) ---
    // OPTIMIZED: direct indexed lookup instead of listUsers() (was causing 5s+ webhook latency)
    let clientId: string | null = null;
    if (buyerEmail) {
      // clients.user_id -> auth.users; we resolve via service role
      // Direct query on auth.users is O(1) vs listUsers() which is O(n)
      const { data: authUser } = await supabase
        .schema("auth")
        .from("users")
        .select("id")
        .ilike("email", buyerEmail)
        .maybeSingle();
      if (authUser) {
        const { data: client } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (client) clientId = client.id;
      }
    }

    const normalizedType = eventType.replace(/\./g, "_").toLowerCase();

    if (
      normalizedType === "payment_succeeded" ||
      normalizedType === "payment_succeeded" ||
      normalizedType === "invoice_paid"
    ) {
      const { type, planKey } = classifyProduct(productId, normalizedCents);
      const { error } = await supabase.from("payments").upsert(
        {
          client_id: clientId,
          whop_payment_id: String(whopPaymentId),
          whop_event_id: webhookId,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          amount_cents: normalizedCents,
          currency,
          type,
          plan_key: planKey,
          status: "succeeded",
          paid_at: new Date().toISOString(),
          verified_at: new Date().toISOString(),
          metadata: data,
        },
        { onConflict: "whop_payment_id" }
      );
      if (error) throw error;

      // Activate subscription status for the matched client
      if (clientId) {
        const subStatus = type === "monthly" ? "active" : "active";
        await supabase
          .from("clients")
          .update({
            subscription_status: subStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);
      }

      await markProcessed();
      // CODE-006 fix (2026-10-16): don't log buyer email in plaintext (PII in logs)
      const maskedEmail =
        typeof buyerEmail === "string" && buyerEmail.includes("@")
          ? buyerEmail.replace(/^(.).*(@.*)$/, "$1***$2")
          : "[redacted]";
      console.log("[whop-webhook] payment.succeeded recorded", {
        whopPaymentId,
        buyerEmail: maskedEmail,
        clientId,
        amountCents: normalizedCents,
      });

      // --- Email notifications (fire-and-forget) ---
      const planLabel = PLAN_LABELS[planKey] || planKey;
      const amountStr = formatMoney(normalizedCents, currency);
      // 1. Notify admin (Tauseef)
      sendEmail(
        ADMIN_EMAIL,
        `✅ Payment received: ${amountStr} — ${buyerEmail || "unknown"}`,
        `<h2 style="color:#15803d;">Payment Confirmed ✅</h2>
        <p><strong>${amountStr}</strong> received for <strong>${planLabel}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Buyer</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${buyerName || "—"} (${buyerEmail || "—"})</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${amountStr}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Plan</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${planLabel}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Client linked</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${clientId ? "✅ Yes (auto-activated)" : "⚠️ No — manual review needed"}</td></tr>
          <tr><td style="padding:8px;"><strong>Whop ID</strong></td><td style="padding:8px;font-family:monospace;font-size:.85em;">${whopPaymentId}</td></tr>
        </table>
        <p><a href="https://seorankgulf.com/admin/payments" style="background:#f59e0b;color:#111827;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;">View in Admin →</a></p>`
      );
      // 2. Confirm to the client
      if (buyerEmail) {
        sendEmail(
          buyerEmail,
          `Payment confirmed — ${planLabel} | SEORankGulf`,
          `<h2 style="color:#15803d;">Payment Confirmed ✅</h2>
          <p>Hi ${buyerName || "there"},</p>
          <p>We've received your payment of <strong>${amountStr}</strong> for <strong>${planLabel}</strong>.</p>
          <p>Your account ${clientId ? "has been activated automatically" : "is being set up"} — we'll be in touch shortly with next steps.</p>
          <p>Questions? Just reply to this email.</p>
          <p>— The SEORankGulf Team</p>`
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (
      normalizedType === "payment_failed" ||
      normalizedType === "payment_canceled" ||
      normalizedType === "payment_cancelled"
    ) {
      const { type, planKey } = classifyProduct(productId, normalizedCents);
      await supabase.from("payments").upsert(
        {
          client_id: clientId,
          whop_payment_id: String(whopPaymentId),
          whop_event_id: webhookId,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          amount_cents: normalizedCents,
          currency,
          type,
          plan_key: planKey,
          status: "failed",
          verified_at: new Date().toISOString(),
          metadata: data,
        },
        { onConflict: "whop_payment_id" }
      );
      await markProcessed();

      // --- Notify admin of failed payment ---
      const failPlanLabel = PLAN_LABELS[planKey] || planKey;
      const failAmountStr = formatMoney(normalizedCents, currency);
      sendEmail(
        ADMIN_EMAIL,
        `❌ Payment failed: ${failAmountStr} — ${buyerEmail || "unknown"}`,
        `<h2 style="color:#dc2626;">Payment Failed ❌</h2>
        <p>A payment of <strong>${failAmountStr}</strong> for <strong>${failPlanLabel}</strong> did not go through.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Buyer</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${buyerName || "—"} (${buyerEmail || "—"})</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${failAmountStr}</td></tr>
          <tr><td style="padding:8px;"><strong>Event</strong></td><td style="padding:8px;font-family:monospace;font-size:.85em;">${normalizedType}</td></tr>
        </table>
        <p><a href="https://seorankgulf.com/admin/payments" style="background:#f59e0b;color:#111827;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;">View in Admin →</a></p>`
      );
      // Notify the buyer too
      if (buyerEmail) {
        sendEmail(
          buyerEmail,
          `Payment issue — ${failPlanLabel} | SEORankGulf`,
          `<h2 style="color:#dc2626;">Payment Didn't Go Through</h2>
          <p>Hi ${buyerName || "there"},</p>
          <p>Your payment of <strong>${failAmountStr}</strong> for <strong>${failPlanLabel}</strong> could not be completed.</p>
          <p>No charge was made. Please try again, or contact us if you need help.</p>
          <p>— The SEORankGulf Team</p>`
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (normalizedType === "membership_activated") {
      const membershipId = data.id || data.membership_id;
      if (clientId) {
        await supabase.from("subscriptions").upsert(
          {
            client_id: clientId,
            whop_subscription_id: String(membershipId),
            whop_plan_id: String(productId || ""),
            buyer_email: buyerEmail,
            plan: "care",
            amount_cents: normalizedCents,
            currency,
            status: "active",
            current_period_start: new Date().toISOString(),
          },
          { onConflict: "whop_subscription_id" }
        );
        await supabase
          .from("clients")
          .update({
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientId);
      }
      await markProcessed();
      return NextResponse.json({ ok: true });
    }

    if (normalizedType === "membership_deactivated") {
      const membershipId = data.id || data.membership_id;
      if (membershipId) {
        // Find the subscription to identify the owning client.
        // If lookup fails or is ambiguous, we skip the client downgrade (safe default).
        const { data: sub, error: subError } = await supabase
          .from("subscriptions")
          .select("client_id")
          .eq("whop_subscription_id", String(membershipId))
          .maybeSingle();
        if (subError) {
          console.error(
            "[whop-webhook] membership.deactivated: subscription lookup failed",
            subError.message
          );
        }

        // Mark this subscription cancelled (existing behavior, unchanged).
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("whop_subscription_id", String(membershipId));

        // Downgrade the client only when:
        //  1. the lookup succeeded and identified a linked client, and
        //  2. no other active subscription remains for that client.
        // Note: the cancelled subscription above already has status='cancelled',
        // so any remaining 'active' rows are genuinely other subscriptions.
        // No .neq() exclusion needed — ordering makes it unnecessary.
        if (!subError && sub?.client_id) {
          const { data: otherActive, error: activeError } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("client_id", sub.client_id)
            .eq("status", "active")
            .limit(1);
          if (activeError) {
            console.error(
              "[whop-webhook] membership.deactivated: active-subscription check failed",
              activeError.message
            );
          } else if (!otherActive || otherActive.length === 0) {
            await supabase
              .from("clients")
              .update({
                subscription_status: "cancelled",
                updated_at: new Date().toISOString(),
              })
              .eq("id", sub.client_id);
          }
          // else: client retains another active subscription — leave status as-is.
        }
        // else: lookup failed / no linked client — do not downgrade.
      }
      await markProcessed();
      return NextResponse.json({ ok: true });
    }

    // Unknown event — acknowledged, logged, not processed
    await markProcessed();
    return NextResponse.json({ ok: true, unhandled: eventType });
  } catch (err: any) {
    console.error("[whop-webhook] handler error", err?.message || err);
    try {
      await supabase
        .from("webhook_events")
        .update({ processed: false, error: String(err?.message || err) })
        .eq("provider", "whop")
        .eq("webhook_id", webhookId);
    } catch {
      /* ignore */
    }
    // Return 200 anyway? No — return 500 so Whop retries a genuinely failed fulfillment.
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}

// Whop only sends POST; be explicit for other methods.
export async function GET() {
  return NextResponse.json({ ok: true, service: "whop-webhook" });
}
