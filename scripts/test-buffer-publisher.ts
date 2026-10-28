/**
 * Buffer publisher tests (no network, no database).
 * Run: npx tsx scripts/test-buffer-publisher.ts
 *
 * Covers the publish-once contract of lib/buffer-publisher.ts:
 * due-pick order, one article per run, claim idempotency (a second run
 * can never publish the same article twice), duplicate-slug recovery,
 * session-failure release, and attempt/terminal failure handling.
 */
import {
  publishNextQueuedArticle,
  MAX_PUBLISH_ATTEMPTS,
  type AdminPublishResult,
  type QueueStore,
  type QueuedArticle,
  type RunLogEntry,
} from "../lib/buffer-publisher";

let passed = 0,
  failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function article(id: string, slug: string, publishAt: string): QueuedArticle {
  return {
    id,
    slug,
    title: `Title ${slug}`,
    excerpt: "excerpt",
    content: [{ type: "p", text: "body" }],
    keywords: ["seo"],
    cover_image: null,
    publish_at: publishAt,
    status: "queued",
    attempts: 0,
  };
}

class FakeStore implements QueueStore {
  rows: QueuedArticle[];
  logs: RunLogEntry[] = [];
  constructor(rows: QueuedArticle[]) {
    this.rows = rows.map((r) => ({ ...r }));
  }
  async findNextDue(nowIso: string) {
    const due = this.rows
      .filter((r) => r.status === "queued" && r.publish_at <= nowIso)
      .sort((a, b) => (a.publish_at < b.publish_at ? -1 : 1));
    return due[0] ?? null;
  }
  async claim(id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (!row || row.status !== "queued") return false;
    row.status = "publishing";
    return true;
  }
  async release(id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (row && row.status === "publishing") row.status = "queued";
  }
  async complete(id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.status = "published";
  }
  async fail(id: string, attempts: number, _error: string, terminal: boolean) {
    const row = this.rows.find((r) => r.id === id);
    if (row) {
      row.attempts = attempts;
      row.status = terminal ? "failed" : "queued";
    }
  }
  async countByStatus() {
    const counts: Record<string, number> = {};
    for (const r of this.rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return counts;
  }
  async nextQueued() {
    return this.rows.find((r) => r.status === "queued") ?? null;
  }
  async lastRun() {
    return null;
  }
  async logRun(entry: RunLogEntry) {
    this.logs.push(entry);
    return true;
  }
}

const okAdmin = async (): Promise<AdminPublishResult> => ({
  ok: true,
  httpStatus: 200,
  postId: "post-1",
  slug: null,
  duplicateSlug: false,
  error: null,
});
const liveYes = async () => true;
const NOW = new Date("2026-10-27T03:00:00.000Z");

async function main() {
  console.log("\n=== Buffer Publisher Tests ===\n");

  console.log("1. Empty queue → noop, logged:");
  {
    const store = new FakeStore([]);
    const r = await publishNextQueuedArticle(store, okAdmin, liveYes, true, NOW);
    check("outcome noop", r.outcome === "noop");
    check("run logged", r.runLogged && store.logs.length === 1);
  }

  console.log("\n2. Not-yet-due article is not published:");
  {
    const store = new FakeStore([article("1", "future", "2026-10-28T03:00:00.000Z")]);
    let calls = 0;
    const counting = async () => {
      calls++;
      return okAdmin();
    };
    const r = await publishNextQueuedArticle(store, counting, liveYes, true, NOW);
    check("outcome noop", r.outcome === "noop");
    check("admin API never called", calls === 0);
  }

  console.log("\n3. Oldest due article publishes; only ONE per run:");
  {
    const store = new FakeStore([
      article("2", "newer", "2026-10-26T03:00:00.000Z"),
      article("1", "older", "2026-10-25T03:00:00.000Z"),
    ]);
    const published: string[] = [];
    const spy = async (a: QueuedArticle) => {
      published.push(a.slug);
      return okAdmin();
    };
    const r = await publishNextQueuedArticle(store, spy, liveYes, true, NOW);
    check("outcome published", r.outcome === "published");
    check("oldest picked", published[0] === "older");
    check("exactly one publish call", published.length === 1);
    check("other stays queued", store.rows.find((x) => x.slug === "newer")?.status === "queued");
  }

  console.log("\n4. Second run cannot re-publish (idempotency):");
  {
    const store = new FakeStore([article("1", "once", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const spy = async () => {
      calls++;
      return okAdmin();
    };
    await publishNextQueuedArticle(store, spy, liveYes, true, NOW);
    const r2 = await publishNextQueuedArticle(store, spy, liveYes, true, NOW);
    check("first run published", calls === 1);
    check("second run noop", r2.outcome === "noop");
    check("admin API still called once", calls === 1);
  }

  console.log("\n5. Lost claim → already_claimed, no publish:");
  {
    const store = new FakeStore([article("1", "race", "2026-10-26T03:00:00.000Z")]);
    store.claim = async () => false; // another run won the claim
    let calls = 0;
    const spy = async () => {
      calls++;
      return okAdmin();
    };
    const r = await publishNextQueuedArticle(store, spy, liveYes, true, NOW);
    check("outcome already_claimed", r.outcome === "already_claimed");
    check("admin API never called", calls === 0);
  }

  console.log("\n6. Duplicate slug from admin API → completed, never retried:");
  {
    const store = new FakeStore([article("1", "dupe", "2026-10-26T03:00:00.000Z")]);
    const dupeAdmin = async (): Promise<AdminPublishResult> => ({
      ok: false,
      httpStatus: 400,
      postId: null,
      slug: null,
      duplicateSlug: true,
      error: "A post with this slug already exists.",
    });
    const r = await publishNextQueuedArticle(store, dupeAdmin, liveYes, true, NOW);
    check("outcome already_published", r.outcome === "already_published");
    check("queue row completed", store.rows[0].status === "published");
  }

  console.log("\n7. Admin session failure → claim released, no attempt burned:");
  {
    const store = new FakeStore([article("1", "sess", "2026-10-26T03:00:00.000Z")]);
    const sessAdmin = async (): Promise<AdminPublishResult> => ({
      ok: false,
      httpStatus: 0,
      postId: null,
      slug: null,
      duplicateSlug: false,
      sessionFailed: true,
      error: "admin_session_failed",
    });
    const r = await publishNextQueuedArticle(store, sessAdmin, liveYes, true, NOW);
    check("outcome admin_session_failed", r.outcome === "admin_session_failed");
    check("row back to queued", store.rows[0].status === "queued");
    check("attempts unchanged", store.rows[0].attempts === 0);
  }

  console.log("\n8. Publish failure → attempts grow, terminal at max:");
  {
    const failing = article("1", "flaky", "2026-10-26T03:00:00.000Z");
    failing.attempts = MAX_PUBLISH_ATTEMPTS - 1;
    const store = new FakeStore([failing]);
    const failAdmin = async (): Promise<AdminPublishResult> => ({
      ok: false,
      httpStatus: 500,
      postId: null,
      slug: null,
      duplicateSlug: false,
      error: "Create failed.",
    });
    const r = await publishNextQueuedArticle(store, failAdmin, liveYes, true, NOW);
    check("outcome publish_failed", r.outcome === "publish_failed");
    check("row parked as failed", store.rows[0].status === "failed");
    check("attempts = max", store.rows[0].attempts === MAX_PUBLISH_ATTEMPTS);
  }

  console.log("\n9. Published but not live in window → pending, still completed:");
  {
    const store = new FakeStore([article("1", "slow", "2026-10-26T03:00:00.000Z")]);
    const r = await publishNextQueuedArticle(store, okAdmin, async () => false, true, NOW);
    check("outcome published_pending_live", r.outcome === "published_pending_live");
    check("live_verified false recorded", r.liveVerified === false);
    check("queue row published", store.rows[0].status === "published");
  }

  console.log("\n10. Bare 401 then success on in-run retry → published, one queue attempt:");
  {
    const store = new FakeStore([article("1", "retry-win", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const flaky = async (): Promise<AdminPublishResult> => {
      calls++;
      if (calls === 1) {
        return {
          ok: false,
          httpStatus: 401,
          postId: null,
          slug: null,
          duplicateSlug: false,
          error: "HTTP 401",
          detail: 'HTTP 401 without the admin route\'s JSON error (content-type: text/html; body starts: "<html>")',
        };
      }
      return okAdmin();
    };
    const r = await publishNextQueuedArticle(store, flaky, liveYes, true, NOW);
    check("outcome published", r.outcome === "published");
    check("admin API called twice", calls === 2);
    check("queue row published", store.rows[0].status === "published");
    check("no queue attempt burned", store.rows[0].attempts === 0);
    check(
      "run log notes the retry",
      (store.logs[0]?.detail ?? "").includes("First attempt in this run returned HTTP 401"),
      store.logs[0]?.detail ?? ""
    );
  }

  console.log("\n11. 401 twice → publish_failed, exactly ONE queue attempt burned:");
  {
    const store = new FakeStore([article("1", "retry-lose", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const always401 = async (): Promise<AdminPublishResult> => {
      calls++;
      return {
        ok: false,
        httpStatus: 401,
        postId: null,
        slug: null,
        duplicateSlug: false,
        error: "Not signed in.",
      };
    };
    const r = await publishNextQueuedArticle(store, always401, liveYes, true, NOW);
    check("outcome publish_failed", r.outcome === "publish_failed");
    check("admin API called twice (one retry)", calls === 2);
    check("attempts incremented by one only", store.rows[0].attempts === 1);
    check("row back to queued for next run", store.rows[0].status === "queued");
    check(
      "run log keeps the route's real error message",
      (store.logs[0]?.detail ?? "").includes("Not signed in."),
      store.logs[0]?.detail ?? ""
    );
  }

  console.log("\n12. Non-retryable 400 failure → no in-run retry:");
  {
    const store = new FakeStore([article("1", "bad-request", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const badReq = async (): Promise<AdminPublishResult> => {
      calls++;
      return {
        ok: false,
        httpStatus: 400,
        postId: null,
        slug: null,
        duplicateSlug: false,
        error: "Create failed.",
      };
    };
    const r = await publishNextQueuedArticle(store, badReq, liveYes, true, NOW);
    check("outcome publish_failed", r.outcome === "publish_failed");
    check("admin API called once", calls === 1);
  }

  console.log("\n13. Session failure on first call → no retry, claim released:");
  {
    const store = new FakeStore([article("1", "sess-first", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const sessFail = async (): Promise<AdminPublishResult> => {
      calls++;
      return {
        ok: false,
        httpStatus: 0,
        postId: null,
        slug: null,
        duplicateSlug: false,
        sessionFailed: true,
        error: "admin_session_failed",
        detail: 'Admin session minting failed at step "verify_otp": OTP expired',
      };
    };
    const r = await publishNextQueuedArticle(store, sessFail, liveYes, true, NOW);
    check("outcome admin_session_failed", r.outcome === "admin_session_failed");
    check("admin API called once", calls === 1);
    check("attempts unchanged", store.rows[0].attempts === 0);
    check(
      "run log carries minting step diagnostics",
      (store.logs[0]?.detail ?? "").includes("verify_otp"),
      store.logs[0]?.detail ?? ""
    );
  }

  console.log("\n14. 401 then session failure on retry → session path, no attempt burned:");
  {
    const store = new FakeStore([article("1", "sess-retry", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const mixed = async (): Promise<AdminPublishResult> => {
      calls++;
      if (calls === 1) {
        return {
          ok: false,
          httpStatus: 401,
          postId: null,
          slug: null,
          duplicateSlug: false,
          error: "HTTP 401",
        };
      }
      return {
        ok: false,
        httpStatus: 0,
        postId: null,
        slug: null,
        duplicateSlug: false,
        sessionFailed: true,
        error: "admin_session_failed",
        detail: 'Admin session minting failed at step "generate_link": rate limited',
      };
    };
    const r = await publishNextQueuedArticle(store, mixed, liveYes, true, NOW);
    check("outcome admin_session_failed", r.outcome === "admin_session_failed");
    check("admin API called twice", calls === 2);
    check("row back to queued", store.rows[0].status === "queued");
    check("attempts unchanged", store.rows[0].attempts === 0);
  }

  console.log("\n15. Network-level failure (status 0) is retried once:");
  {
    const store = new FakeStore([article("1", "net-flake", "2026-10-26T03:00:00.000Z")]);
    let calls = 0;
    const netFlake = async (): Promise<AdminPublishResult> => {
      calls++;
      if (calls === 1) {
        return {
          ok: false,
          httpStatus: 0,
          postId: null,
          slug: null,
          duplicateSlug: false,
          error: "admin_fetch_failed",
          detail: "Admin API fetch failed before any response: fetch failed",
        };
      }
      return okAdmin();
    };
    const r = await publishNextQueuedArticle(store, netFlake, liveYes, true, NOW);
    check("outcome published", r.outcome === "published");
    check("admin API called twice", calls === 2);
  }

  console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
