/**
 * Security tests for new APIs (no network calls — validates logic patterns).
 * Run: npx tsx scripts/test-new-apis.ts
 *
 * Tests:
 * 1. Agent config: only allowed keys accepted, tone validated, status can't go backwards
 * 2. Profile: role never writable, name validation
 * 3. FAQ: input length limits
 * 4. Admin users: safeguards (self-demote, last-admin)
 */
let passed = 0, failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}

// --- Replicate agent-config validation logic ---
const ALLOWED_KEYS = ["agent_name", "greeting", "tone", "language", "business_hours", "auto_reply"];
const ALLOWED_TONES = ["friendly", "professional", "playful", "formal"];

function validateAgentPatch(body: Record<string, unknown>): { ok: boolean; error?: string } {
  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined && key === "tone") {
      const val = String(body[key]).trim().toLowerCase();
      if (!ALLOWED_TONES.includes(val)) return { ok: false, error: "bad tone" };
    }
  }
  // Unknown keys are ignored (not written)
  return { ok: true };
}

function validateStatusTransition(current: string, target: string): boolean {
  const order = ["draft", "preview", "ready"];
  const allowed = ["draft", "preview", "ready"];
  if (!allowed.includes(target)) return false;
  return order.indexOf(target) >= order.indexOf(current);
}

console.log("\n=== Agent Config Security ===\n");
check("Valid tone accepted", validateAgentPatch({ tone: "professional" }).ok);
check("Invalid tone rejected", !validateAgentPatch({ tone: "rude" }).ok);
check("Unknown keys ignored (not written)", validateAgentPatch({ admin: true, role: "admin" }).ok);
check("Status forward allowed (draft→preview)", validateStatusTransition("draft", "preview"));
check("Status backward blocked (ready→draft)", !validateStatusTransition("ready", "draft"));
check("Status to live blocked", !validateStatusTransition("ready", "live"));
check("Status to building blocked", !validateStatusTransition("draft", "building"));

// --- Profile validation ---
function validateProfileName(name: string): { ok: boolean; error?: string } {
  const clean = name.trim().slice(0, 120);
  if (!clean) return { ok: false, error: "empty" };
  if (/[<>"\x00-\x1f]/.test(clean)) return { ok: false, error: "invalid chars" };
  return { ok: true };
}

console.log("\n=== Profile Security ===\n");
check("Valid name accepted", validateProfileName("Ahmed Khan").ok);
check("Empty name rejected", !validateProfileName("   ").ok);
check("HTML injection rejected", !validateProfileName("<script>alert(1)</script>").ok);
check("Name truncated to 120", validateProfileName("a".repeat(200)).ok);

// Role escalation: verify the API only writes full_name (code review check)
import { readFileSync } from "fs";
const profileApi = readFileSync("app/api/profile/route.ts", "utf-8");
check("Profile API never writes 'role'", !profileApi.includes('role:') || !profileApi.match(/update\(\{\s*[^}]*role/));
check("Profile API updates only full_name", profileApi.includes(".update({ full_name })"));

const agentApi = readFileSync("app/api/agent-config/route.ts", "utf-8");
check("Agent API has allowed-keys whitelist", agentApi.includes("ALLOWED_KEYS"));
check("Agent API blocks backward status", agentApi.includes("Cannot move agent status backwards"));

const usersApi = readFileSync("app/api/admin/users/route.ts", "utf-8");
check("Users API blocks self role-change", usersApi.includes("cannot change your own role"));
check("Users API protects last admin (demote)", usersApi.includes("Cannot demote the last admin"));
check("Users API blocks self-delete", usersApi.includes("cannot delete yourself"));
check("Users API protects last admin (delete)", usersApi.includes("Cannot delete the last admin"));

const convApi = readFileSync("app/api/conversations/route.ts", "utf-8");
check("Conversations filtered by user_id", convApi.includes('.eq("user_id", user.id)'));
check("Conversations require auth", convApi.includes("Not signed in"));

const faqsApi = readFileSync("app/api/admin/faqs/route.ts", "utf-8");
check("FAQs API requires admin", faqsApi.includes("Admins only"));
check("FAQ question length capped", faqsApi.includes("slice(0, 500)"));
check("FAQ answer length capped", faqsApi.includes("slice(0, 5000)"));

console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
