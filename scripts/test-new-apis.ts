/**
 * Security tests for new APIs (no network calls — validates logic patterns).
 * Run: npx tsx scripts/test-new-apis.ts
 *
 * Tests:
 * 1. Profile: role never writable, name validation
 * 2. FAQ: input length limits
 * 3. Admin users: safeguards (self-demote, last-admin)
 * 4. Registered-users visibility: admin-only guards + registration defaults
 */
let passed = 0, failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}

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

const usersApi = readFileSync("app/api/admin/users/route.ts", "utf-8");
check("Users API blocks self role-change", usersApi.includes("cannot change your own role"));
check("Users API protects last admin (demote)", usersApi.includes("Cannot demote the last admin"));
check("Users API blocks self-delete", usersApi.includes("cannot delete yourself"));
check("Users API protects last admin (delete)", usersApi.includes("Cannot delete the last admin"));

console.log("\n=== Registered Users — Admin-Only Guards ===\n");
check("Users API rejects signed-out callers (401)", usersApi.includes('"Not signed in."') && usersApi.includes("status: 401"));
check("Users API rejects non-admins (403)", usersApi.includes('"Admins only."') && usersApi.includes("status: 403"));
check("Users API runs admin guard before listing auth users", usersApi.indexOf("await requireAdmin()") > -1 && usersApi.indexOf("await requireAdmin()") < usersApi.indexOf("service.auth.admin.listUsers"));

const usersPage = readFileSync("app/admin/users/page.tsx", "utf-8");
check("Users page redirects signed-out visitors to login", usersPage.includes('if (!user) redirect("/admin/login")'));
check("Users page redirects non-admins to login", usersPage.includes('role !== "admin"') && usersPage.includes('redirect("/admin/login")'));

const adminHome = readFileSync("app/admin/page.tsx", "utf-8");
check("Admin dashboard links to /admin/users", adminHome.includes('href="/admin/users"'));

console.log("\n=== Registration Defaults ===\n");
const signupPage = readFileSync("app/signup/page.tsx", "utf-8");
check("Signup page creates accounts via supabase signUp", signupPage.includes("supabase.auth.signUp"));
check("Signup page links back to /login", signupPage.includes('href="/login"'));

const schemaSql = readFileSync("supabase/schema.sql", "utf-8");
check("New-user trigger creates a profile", schemaSql.includes("handle_new_user") && schemaSql.includes("insert into public.profiles"));
check("Default profile role is 'client' (never admin)", schemaSql.includes("'client')") && schemaSql.includes("default 'client'"));

const faqsApi = readFileSync("app/api/admin/faqs/route.ts", "utf-8");
check("FAQs API requires admin", faqsApi.includes("Admins only"));
check("FAQ question length capped", faqsApi.includes("slice(0, 500)"));
check("FAQ answer length capped", faqsApi.includes("slice(0, 5000)"));

console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
