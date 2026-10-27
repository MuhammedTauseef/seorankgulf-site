/**
 * Buffer queue mutation tests (no network, no database).
 * Run: npx tsx scripts/test-buffer-queue.ts
 *
 * Covers lib/buffer-queue.ts — the edit / reschedule / delete logic
 * behind PUT + DELETE /api/admin/blog/queue:
 * - queued items CAN be edited, rescheduled and deleted;
 * - 'publishing', 'published' and 'failed' items REFUSE every
 *   mutation (the status guards), and stay byte-identical;
 * - missing rows are 404, invalid patches are 400;
 * - a row that flips out of 'queued' between the status read and the
 *   conditional write is refused (409), never raced.
 */
import {
  deleteQueuedItem,
  updateQueuedItem,
  type QueueItemRecord,
  type QueueItemPatch,
  type QueueMutationStore,
} from "../lib/buffer-queue";

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

function item(
  id: string,
  status: QueueItemRecord["status"]
): QueueItemRecord {
  return {
    id,
    slug: `slug-${id}`,
    title: `Title ${id}`,
    excerpt: "excerpt",
    content: [{ type: "p", text: "body" }],
    keywords: ["seo"],
    cover_image: null,
    publish_at: "2026-10-28T04:00:00.000Z",
    status,
    attempts: 0,
    last_error: null,
  };
}

/** In-memory store with the same conditional-write semantics as Supabase. */
class FakeStore implements QueueMutationStore {
  rows: QueueItemRecord[];
  /** When true, writes pretend the row flipped out of 'queued' first. */
  simulateRace = false;
  constructor(rows: QueueItemRecord[]) {
    this.rows = rows.map((r) => ({ ...r }));
  }
  async getById(id: string) {
    const row = this.rows.find((r) => r.id === id);
    return row ? { ...row } : null;
  }
  async updateIfQueued(id: string, patch: QueueItemPatch) {
    if (this.simulateRace) return false;
    const row = this.rows.find((r) => r.id === id);
    if (!row || row.status !== "queued") return false;
    Object.assign(row, patch);
    return true;
  }
  async deleteIfQueued(id: string) {
    if (this.simulateRace) return false;
    const i = this.rows.findIndex((r) => r.id === id);
    if (i < 0 || this.rows[i].status !== "queued") return false;
    this.rows.splice(i, 1);
    return true;
  }
}

async function main() {
  console.log("\n=== Buffer Queue Mutation Tests ===\n");

  console.log("1. Edit a QUEUED item succeeds (details + content):");
  {
    const store = new FakeStore([item("1", "queued")]);
    const r = await updateQueuedItem(store, "1", {
      title: "New title",
      excerpt: "New excerpt",
      content: [{ type: "h2", text: "Heading" }],
      keywords: ["seo", "dubai"],
      cover_image: "https://example.com/cover.jpg",
    });
    check("update ok", r.ok === true);
    const row = store.rows[0];
    check("title changed", row.title === "New title");
    check("excerpt changed", row.excerpt === "New excerpt");
    check(
      "content changed (block format)",
      Array.isArray(row.content) &&
        (row.content[0] as { type?: string }).type === "h2"
    );
    check("keywords changed", row.keywords.join(",") === "seo,dubai");
    check("cover changed", row.cover_image === "https://example.com/cover.jpg");
    check("status stays queued", row.status === "queued");
  }

  console.log("\n2. Reschedule a QUEUED item (publish_at only):");
  {
    const store = new FakeStore([item("1", "queued")]);
    const r = await updateQueuedItem(store, "1", {
      publish_at: "2026-11-02T09:30:00.000Z",
    });
    check("reschedule ok", r.ok === true);
    check(
      "publish_at moved",
      store.rows[0].publish_at === "2026-11-02T09:30:00.000Z"
    );
    check("title untouched", store.rows[0].title === "Title 1");
  }

  console.log("\n3. Edit a PUBLISHING item is REFUSED:");
  {
    const store = new FakeStore([item("1", "publishing")]);
    const before = JSON.stringify(store.rows[0]);
    const r = await updateQueuedItem(store, "1", { title: "Hijack" });
    check("update refused", r.ok === false);
    check("status 409", !r.ok && r.status === 409);
    check("row unchanged", JSON.stringify(store.rows[0]) === before);
  }

  console.log("\n4. Edit a PUBLISHED item is REFUSED:");
  {
    const store = new FakeStore([item("1", "published")]);
    const before = JSON.stringify(store.rows[0]);
    const r = await updateQueuedItem(store, "1", {
      title: "Hijack",
      publish_at: "2027-01-01T00:00:00.000Z",
    });
    check("update refused", r.ok === false);
    check("status 409", !r.ok && r.status === 409);
    check("row unchanged", JSON.stringify(store.rows[0]) === before);
  }

  console.log("\n5. Edit a FAILED item is REFUSED:");
  {
    const store = new FakeStore([item("1", "failed")]);
    const r = await updateQueuedItem(store, "1", { title: "Hijack" });
    check("update refused", r.ok === false);
    check("status 409", !r.ok && r.status === 409);
  }

  console.log("\n6. Delete a QUEUED item succeeds:");
  {
    const store = new FakeStore([item("1", "queued"), item("2", "queued")]);
    const r = await deleteQueuedItem(store, "1");
    check("delete ok", r.ok === true);
    check("row gone", store.rows.length === 1 && store.rows[0].id === "2");
  }

  console.log("\n7. Delete a PUBLISHING item is REFUSED:");
  {
    const store = new FakeStore([item("1", "publishing")]);
    const r = await deleteQueuedItem(store, "1");
    check("delete refused", r.ok === false);
    check("status 409", !r.ok && r.status === 409);
    check("row remains", store.rows.length === 1);
  }

  console.log("\n8. Delete a PUBLISHED item is REFUSED:");
  {
    const store = new FakeStore([item("1", "published")]);
    const r = await deleteQueuedItem(store, "1");
    check("delete refused", r.ok === false);
    check("status 409", !r.ok && r.status === 409);
    check("row remains", store.rows.length === 1);
  }

  console.log("\n9. Delete a FAILED item is REFUSED:");
  {
    const store = new FakeStore([item("1", "failed")]);
    const r = await deleteQueuedItem(store, "1");
    check("delete refused", r.ok === false);
    check("status 409", !r.ok && r.status === 409);
    check("row remains", store.rows.length === 1);
  }

  console.log("\n10. Missing rows are 404:");
  {
    const store = new FakeStore([]);
    const ru = await updateQueuedItem(store, "nope", { title: "X" });
    check("update 404", ru.ok === false && ru.status === 404);
    const rd = await deleteQueuedItem(store, "nope");
    check("delete 404", rd.ok === false && rd.status === 404);
  }

  console.log("\n11. Invalid patches are 400 and change nothing:");
  {
    const store = new FakeStore([item("1", "queued")]);
    const before = JSON.stringify(store.rows[0]);
    const r1 = await updateQueuedItem(store, "1", { title: "   " });
    check("empty title 400", r1.ok === false && r1.status === 400);
    const r2 = await updateQueuedItem(store, "1", { content: [] });
    check("empty content 400", r2.ok === false && r2.status === 400);
    const r3 = await updateQueuedItem(store, "1", {
      publish_at: "not-a-date",
    });
    check("invalid publish_at 400", r3.ok === false && r3.status === 400);
    const r4 = await updateQueuedItem(store, "1", {});
    check("no fields 400", r4.ok === false && r4.status === 400);
    check("row unchanged", JSON.stringify(store.rows[0]) === before);
  }

  console.log("\n12. Race: row flips out of 'queued' mid-write → 409:");
  {
    const store = new FakeStore([item("1", "queued")]);
    store.simulateRace = true;
    const ru = await updateQueuedItem(store, "1", { title: "New" });
    check("update race 409", ru.ok === false && ru.status === 409);
    const rd = await deleteQueuedItem(store, "1");
    check("delete race 409", rd.ok === false && rd.status === 409);
    check("row remains queued", store.rows[0]?.status === "queued");
  }

  console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
