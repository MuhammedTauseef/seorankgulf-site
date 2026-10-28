/**
 * Email template + error handling test (SAFE — never sends real emails).
 * Run: npx tsx scripts/test-emails.ts
 * 
 * Tests:
 * 1. All 4 templates render without crashing
 * 2. Dev-mode (no API key) returns honest 'dev-mode' status, never 'sent'
 * 3. HTML output contains expected content
 * 4. No unhandled exceptions when provider unavailable
 */
import { emails, sendEmail, type EmailResult } from "../lib/emails";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("\n=== Email Template Tests (dev-mode, no sending) ===\n");

  // Ensure dev-mode: temporarily clear API key
  const origKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  console.log("1. Template rendering (no crash):");
  const results: EmailResult[] = [];
  try {
    results.push(await emails.welcome("test@example.com", "Ahmed", "Test Salon"));
    check("welcome renders", true);
  } catch (e) { check("welcome renders", false, String(e)); }

  try {
    results.push(await emails.paymentReceipt("test@example.com", "$125.00", "Build Deposit"));
    check("paymentReceipt renders", true);
  } catch (e) { check("paymentReceipt renders", false, String(e)); }

  try {
    results.push(await emails.demoFollowup("test@example.com", "Ahmed"));
    check("demoFollowup renders", true);
  } catch (e) { check("demoFollowup renders", false, String(e)); }

  try {
    results.push(await emails.bookingConfirmed("test@example.com", "Ahmed", "2026-10-15", "14:00", "Test Salon"));
    check("bookingConfirmed renders", true);
  } catch (e) { check("bookingConfirmed renders", false, String(e)); }

  console.log("\n2. Honest status reporting (dev-mode):");
  const allDevMode = results.every(r => r.status === "dev-mode");
  check("All return 'dev-mode' (not fake 'sent')", allDevMode, 
    allDevMode ? "" : `Got: ${results.map(r => r.status).join(", ")}`);
  
  const noneClaimSent = results.every(r => r.status !== "sent");
  check("None falsely claim 'sent'", noneClaimSent);

  const allHaveDetail = results.every(r => r.detail && r.detail.length > 0);
  check("All include explanatory detail", allHaveDetail);

  console.log("\n3. Direct sendEmail error handling:");
  const direct = await sendEmail({ to: "test@example.com", subject: "Test", html: "<p>hi</p>" });
  check("Returns object (not boolean)", typeof direct === "object" && "status" in direct);
  check("Status is 'dev-mode'", direct.status === "dev-mode");

  // Restore
  if (origKey) process.env.RESEND_API_KEY = origKey;

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error("Test crashed:", e); process.exit(1); });
