/**
 * Google provider pre-check tests (no real network — fetch is mocked).
 * Run: npx tsx scripts/test-google-provider.ts
 */
import {
  googleProviderStatusFromSettings,
  fetchGoogleProviderStatus,
  type GoogleProviderStatus,
} from "../lib/google-provider";

let passed = 0, failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}

console.log("\n=== Google Provider Pre-Check Tests ===\n");

console.log("1. Settings payload parsing:");
check("google:true → enabled", googleProviderStatusFromSettings({ external: { google: true } }) === "enabled");
check("google:false → disabled", googleProviderStatusFromSettings({ external: { google: false } }) === "disabled");
check("empty object → unknown", googleProviderStatusFromSettings({}) === "unknown");
check("null → unknown", googleProviderStatusFromSettings(null) === "unknown");
check("non-object → unknown", googleProviderStatusFromSettings("nope") === "unknown");
check("external:null → unknown", googleProviderStatusFromSettings({ external: null }) === "unknown");
check("google non-boolean → unknown", googleProviderStatusFromSettings({ external: { google: "yes" } }) === "unknown");
check("google missing → unknown", googleProviderStatusFromSettings({ external: { email: true } }) === "unknown");

function mockFetch(
  handler: (url: string, init?: { headers?: Record<string, string> }) => Promise<unknown>,
  capture: { url?: string; headers?: Record<string, string> }
): typeof fetch {
  return (async (url: unknown, init?: { headers?: Record<string, string> }) => {
    capture.url = String(url);
    capture.headers = init?.headers;
    return handler(String(url), init);
  }) as unknown as typeof fetch;
}

function jsonResponse(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body };
}

async function run() {
  console.log("\n2. Settings fetch:");
  const cap1: { url?: string; headers?: Record<string, string> } = {};
  const s1: GoogleProviderStatus = await fetchGoogleProviderStatus(
    "https://example.supabase.co/",
    "anon-key-123",
    mockFetch(async () => jsonResponse(true, 200, { external: { google: false } }), cap1)
  );
  check("200 + google:false → disabled", s1 === "disabled");
  check("URL is {base}/auth/v1/settings (trailing slash trimmed)",
    cap1.url === "https://example.supabase.co/auth/v1/settings", `got ${cap1.url}`);
  check("apikey header sent", cap1.headers?.apikey === "anon-key-123");

  const s2 = await fetchGoogleProviderStatus(
    "https://example.supabase.co", "k",
    mockFetch(async () => jsonResponse(true, 200, { external: { google: true } }), {})
  );
  check("200 + google:true → enabled", s2 === "enabled");

  const s3 = await fetchGoogleProviderStatus(
    "https://example.supabase.co", "k",
    mockFetch(async () => jsonResponse(false, 500, {}), {})
  );
  check("non-200 → unknown (proceed with OAuth)", s3 === "unknown");

  const s4 = await fetchGoogleProviderStatus(
    "https://example.supabase.co", "k",
    mockFetch(async () => { throw new Error("network down"); }, {})
  );
  check("fetch throws → unknown (proceed with OAuth)", s4 === "unknown");

  const s5 = await fetchGoogleProviderStatus(
    "https://example.supabase.co", "k",
    mockFetch(async () => ({ ok: true, status: 200, json: async () => { throw new Error("bad json"); } }), {})
  );
  check("unparseable body → unknown", s5 === "unknown");

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
