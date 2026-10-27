/**
 * Buffer queue mutations — edit / reschedule / delete for WAITING
 * articles in blog_buffer_queue (used by PUT + DELETE
 * /api/admin/blog/queue and tested by scripts/test-buffer-queue.ts).
 *
 * Safety contract: only rows with status 'queued' may be changed or
 * removed from the admin panel.
 * - 'publishing' rows are mid-publish in the auto-publisher — touching
 *   them could double-publish or corrupt the run.
 * - 'published' rows are finished: the article now lives in blog_posts
 *   and is edited in the normal blog editor, never here.
 * - 'failed' rows are the audit trail of a parked publish failure.
 *
 * The guard is enforced twice: a status read first (for a clear error),
 * then a conditional write (.eq('status', 'queued')) so a row that
 * flips to 'publishing' between the read and the write can never be
 * mutated — the write simply matches nothing.
 *
 * Store functions are injected so the guard logic is testable without
 * a database or network (see scripts/test-buffer-queue.ts), mirroring
 * lib/buffer-publisher.ts.
 */

export type QueueItemStatus = "queued" | "publishing" | "published" | "failed";

export interface QueueItemRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown[];
  keywords: string[];
  cover_image: string | null;
  publish_at: string;
  status: QueueItemStatus;
  attempts: number;
  last_error: string | null;
}

/** Fields the owner may change on a queued item. All optional (partial update). */
export interface QueueItemPatch {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: unknown[];
  keywords?: string[];
  cover_image?: string | null;
  publish_at?: string;
}

export type QueueMutationResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export interface QueueMutationStore {
  /** Full queue row by id, or null. */
  getById(id: string): Promise<QueueItemRecord | null>;
  /**
   * Apply a patch ONLY when the row is still 'queued' (conditional
   * write). Returns true when exactly one row was updated.
   */
  updateIfQueued(id: string, patch: QueueItemPatch): Promise<boolean>;
  /**
   * Delete ONLY when the row is still 'queued' (conditional write).
   * Returns true when exactly one row was deleted.
   */
  deleteIfQueued(id: string): Promise<boolean>;
}

export function slugifyQueueSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const KNOWN_FIELDS = [
  "title",
  "slug",
  "excerpt",
  "content",
  "keywords",
  "cover_image",
  "publish_at",
] as const;

/**
 * Normalize + validate a raw request body into a patch. Same field
 * limits as POST /api/admin/blog/queue (enqueue) and /api/admin/blog.
 */
export function validateQueuePatch(
  body: Record<string, unknown>
): { ok: true; patch: QueueItemPatch } | { ok: false; status: number; error: string } {
  const hasAny = KNOWN_FIELDS.some((f) => body[f] !== undefined);
  if (!hasAny) {
    return { ok: false, status: 400, error: "No fields to update." };
  }

  const patch: QueueItemPatch = {};

  if (body.title !== undefined) {
    const title = String(body.title ?? "").trim().slice(0, 200);
    if (!title) return { ok: false, status: 400, error: "Title required." };
    patch.title = title;
  }

  if (body.slug !== undefined) {
    const slug = slugifyQueueSlug(String(body.slug ?? ""));
    if (!slug) return { ok: false, status: 400, error: "Invalid slug." };
    patch.slug = slug;
  }

  if (body.excerpt !== undefined) {
    patch.excerpt = String(body.excerpt ?? "").trim().slice(0, 500);
  }

  if (body.content !== undefined) {
    if (!Array.isArray(body.content) || body.content.length === 0) {
      return { ok: false, status: 400, error: "Content required." };
    }
    patch.content = body.content.slice(0, 200);
  }

  if (body.keywords !== undefined) {
    patch.keywords = Array.isArray(body.keywords)
      ? body.keywords.map((k) => String(k).slice(0, 60)).slice(0, 10)
      : [];
  }

  if (body.cover_image !== undefined) {
    patch.cover_image =
      String(body.cover_image ?? "").trim().slice(0, 500) || null;
  }

  if (body.publish_at !== undefined) {
    const raw = String(body.publish_at ?? "").trim();
    const when = raw ? new Date(raw) : null;
    if (!when || Number.isNaN(when.getTime())) {
      return {
        ok: false,
        status: 400,
        error: "publish_at (ISO date) required.",
      };
    }
    patch.publish_at = when.toISOString();
  }

  return { ok: true, patch };
}

function notQueuedError(status: QueueItemStatus): QueueMutationResult {
  return {
    ok: false,
    status: 409,
    error:
      status === "published"
        ? "This article is already published — edit it under Blog posts, not in the buffer queue."
        : `Only queued items can be changed — this item is ${status}.`,
  };
}

/** Edit / reschedule a queued item. Refuses every other status. */
export async function updateQueuedItem(
  store: QueueMutationStore,
  id: string,
  body: Record<string, unknown>
): Promise<QueueMutationResult> {
  const validated = validateQueuePatch(body);
  if (!validated.ok) return validated;

  const existing = await store.getById(id);
  if (!existing) {
    return { ok: false, status: 404, error: "Queue item not found." };
  }
  if (existing.status !== "queued") {
    return notQueuedError(existing.status);
  }

  let updated: boolean;
  try {
    updated = await store.updateIfQueued(id, validated.patch);
  } catch (e) {
    if ((e as { code?: string })?.code === "23505") {
      return {
        ok: false,
        status: 400,
        error: "An article with this slug is already in the queue.",
      };
    }
    throw e;
  }
  if (!updated) {
    // The row flipped out of 'queued' between the read and the write
    // (e.g. the auto-publisher claimed it). Refuse rather than race it.
    return {
      ok: false,
      status: 409,
      error: "This item changed while you were editing — reload and try again.",
    };
  }
  return { ok: true };
}

/** Remove a queued item from the buffer. Refuses every other status. */
export async function deleteQueuedItem(
  store: QueueMutationStore,
  id: string
): Promise<QueueMutationResult> {
  const existing = await store.getById(id);
  if (!existing) {
    return { ok: false, status: 404, error: "Queue item not found." };
  }
  if (existing.status !== "queued") {
    return notQueuedError(existing.status);
  }

  const deleted = await store.deleteIfQueued(id);
  if (!deleted) {
    return {
      ok: false,
      status: 409,
      error: "This item changed before it could be removed — reload and try again.",
    };
  }
  return { ok: true };
}

interface SupabaseLike {
  from(table: string): any;
}

/** QueueMutationStore backed by a Supabase client (admin session). */
export function createSupabaseQueueMutationStore(
  supabase: SupabaseLike
): QueueMutationStore {
  return {
    async getById(id: string) {
      const { data, error } = await supabase
        .from("blog_buffer_queue")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`getById failed: ${error.message}`);
      return (data as QueueItemRecord | null) ?? null;
    },

    async updateIfQueued(id: string, patch: QueueItemPatch) {
      const { data, error } = await supabase
        .from("blog_buffer_queue")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("status", "queued")
        .select("id");
      if (error) {
        const e = new Error(
          `updateIfQueued failed: ${error.message}`
        ) as Error & { code?: string };
        e.code = error.code;
        throw e;
      }
      return Array.isArray(data) && data.length === 1;
    },

    async deleteIfQueued(id: string) {
      const { error, count } = await supabase
        .from("blog_buffer_queue")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("status", "queued");
      if (error) throw new Error(`deleteIfQueued failed: ${error.message}`);
      return count === 1;
    },
  };
}
