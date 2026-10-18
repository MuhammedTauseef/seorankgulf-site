/**
 * Rate limiter + KB validation tests (no network, no sending).
 * Run: npx tsx scripts/test-security.ts
 */
import { rateLimit, clientIp, userKey } from "../lib/rate-limit";

let passed = 0, failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}

// Mock Request with headers
function mockReq(headers: Record<string, string>): Request {
  return { headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } } as unknown as Request;
}

console.log("\n=== Rate Limiter Tests ===\n");

console.log("1. Basic limiting:");
const key = `test-${Date.now()}`;
let allowed = 0;
for (let i = 0; i < 5; i++) if (rateLimit(key, 3, 60_000)) allowed++;
check("Allows up to limit (3)", allowed === 3, `got ${allowed}`);
check("Blocks 4th and 5th", allowed === 3);

console.log("\n2. IP extraction (anti-spoof):");
const r1 = mockReq({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" });
check("Prefers x-real-ip over spoofed x-forwarded-for", clientIp(r1) === "1.2.3.4");

const r2 = mockReq({ "x-forwarded-for": "not-an-ip!!!" });
check("Rejects malformed IP", clientIp(r2) === "invalid-ip");

const r3 = mockReq({});
check("Returns 'unknown' with no headers", clientIp(r3) === "unknown");

console.log("\n3. User-keyed limiting:");
check("userKey format", userKey("chat", "abc123") === "chat:user:abc123");
const uk = userKey("test", `u-${Date.now()}`);
check("User key limits independently", rateLimit(uk, 1, 60_000) && !rateLimit(uk, 1, 60_000));

console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
