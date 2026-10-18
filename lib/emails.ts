/** Email templates for SEORankGulf. Works with Resend, degrades safely without it.
 *
 * DEV/TEST MODE: When RESEND_API_KEY is not set, emails are logged to console
 * and NOT sent. The return value honestly reports this — never claims delivery.
 *
 * EmailResult.status:
 * - 'sent'     → Resend accepted the email (real delivery attempted)
 * - 'dev-mode' → No API key; logged only, NOT sent (safe for dev/test)
 * - 'failed'   → Tried to send but Resend rejected or network failed
 */

export type EmailStatus = "sent" | "dev-mode" | "failed";

export interface EmailResult {
  status: EmailStatus;
  /** Resend message ID when actually sent */
  id?: string;
  /** Human-readable reason when dev-mode or failed */
  detail?: string;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailParams): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "SEORankGulf <hello@seorankgulf.com>";

  // Dev/test mode: no API key → log honestly, never claim delivery
  if (!apiKey) {
    console.log(`[EMAIL:DEV-MODE] NOT SENT (no RESEND_API_KEY) | To: ${to} | Subject: ${subject}`);
    return { status: "dev-mode", detail: "No RESEND_API_KEY configured — email logged, not sent." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      return { status: "sent", id: (body as { id?: string }).id };
    }
    console.error("[EMAIL] Resend rejected:", res.status, JSON.stringify(body).slice(0, 300));
    return { status: "failed", detail: `Resend rejected with HTTP ${res.status}` };
  } catch (e) {
    console.error("[EMAIL] send error:", e instanceof Error ? e.message : e);
    return { status: "failed", detail: "Network error contacting Resend API" };
  }
}

const wrap = (body: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
  <div style="text-align: center; margin-bottom: 24px;">
    <strong style="font-size: 1.5rem; color: #1e3a5f;">SEORankGulf</strong>
  </div>
  ${body}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.85rem; color: #9ca3af; text-align: center;">
    SEORankGulf — SEO Services by Muhammad Tauseef<br>
    <a href="https://seorankgulf.com" style="color: #f59e0b;">seorankgulf.com</a>
  </div>
</div>`;

export const emails = {
  welcome: (to: string, name: string, businessName: string) =>
    sendEmail({
      to,
      subject: `Welcome to SEORankGulf, ${name}! 🎉`,
      html: wrap(`
        <h2>Hi ${name}!</h2>
        <p>Your account for <strong>${businessName}</strong> is ready.</p>
        <p>Next step: complete your 10-minute onboarding and watch your AI agent come to life.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="https://seorankgulf.com/onboarding" style="background: #f59e0b; color: #111827; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">Build my agent →</a>
        </p>
        <p>Questions? Just reply to this email.</p>
      `),
    }),

  agentReady: (to: string, businessName: string) =>
    sendEmail({
      to,
      subject: `Your AI agent for ${businessName} is ready! 🤖`,
      html: wrap(`
        <h2>Great news!</h2>
        <p>Your AI agent for <strong>${businessName}</strong> has been generated and tested.</p>
        <p>Chat with it, tweak the details, and when you're happy — go live!</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="https://seorankgulf.com/onboarding/preview" style="background: #f59e0b; color: #111827; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">Preview my agent →</a>
        </p>
      `),
    }),

  paymentReceipt: (to: string, amount: string, type: string) =>
    sendEmail({
      to,
      subject: `Payment receipt — ${amount} (${type})`,
      html: wrap(`
        <h2>Thank you!</h2>
        <p>We've received your payment of <strong>${amount}</strong> for <strong>${type}</strong>.</p>
        <p>A detailed invoice is available in your Whop receipt.</p>
        <p>Your agent keeps working for you 24/7. 🚀</p>
      `),
    }),

  monthlyReport: (to: string, businessName: string, stats: { chats: number; leads: number; bookings: number }) =>
    sendEmail({
      to,
      subject: `Your ${businessName} monthly report 📊`,
      html: wrap(`
        <h2>Monthly report</h2>
        <p>Here's what your AI agent did this month for <strong>${businessName}</strong>:</p>
        <ul>
          <li>💬 <strong>${stats.chats}</strong> chats handled</li>
          <li>🎯 <strong>${stats.leads}</strong> leads captured</li>
          <li>📅 <strong>${stats.bookings}</strong> bookings made</li>
        </ul>
        <p>Your agent never sleeps — and neither do your results.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="https://seorankgulf.com/dashboard/client" style="background: #1e3a5f; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">View dashboard →</a>
        </p>
      `),
    }),

  demoFollowup: (to: string, name: string) =>
    sendEmail({
      to,
      subject: `${name}, saw you tried our demo 👀`,
      html: wrap(`
        <h2>Hi ${name}!</h2>
        <p>I noticed you tried our AI demo. What did you think?</p>
        <p>I'd love to build a <strong>free custom demo</strong> for your business — no strings attached.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="https://seorankgulf.com/#contact" style="background: #f59e0b; color: #111827; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">Get my free demo →</a>
        </p>
        <p>— Tauseef, SEORankGulf</p>
      `),
    }),

  bookingConfirmed: (to: string, name: string, date: string, time: string, businessName: string) =>
    sendEmail({
      to,
      subject: `Booking confirmed — ${businessName} 📅`,
      html: wrap(`
        <h2>Hi ${name}!</h2>
        <p>Your appointment with <strong>${businessName}</strong> is confirmed:</p>
        <p style="font-size: 1.2rem; text-align: center; margin: 20px 0;">
          <strong>${date}</strong> at <strong>${time}</strong> (Pakistan time)
        </p>
        <p>We'll send you a reminder before your slot. Need to reschedule? Just reply to this email.</p>
        <p>— ${businessName} (powered by SEORankGulf)</p>
      `),
    }),
};

export { sendEmail };
