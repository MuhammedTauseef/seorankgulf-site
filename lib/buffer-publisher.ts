/**
 * Buffer publisher core — publishes AT MOST ONE due queued article,
 * through the site's ADMIN publish API (POST /api/admin/blog), never by
 * writing to blog_posts directly.
 *
 * A queued article lives only in blog_buffer_queue until the admin
 * action creates the post. The queue claim (status queued → publishing,
 * conditional on still being 'queued') is queue bookkeeping: only the
 * claiming run proceeds, so a racing or repeated run can never trigger
 * a second publish of the same article.
 *
 * Store + publish functions are injected so the orchestration is
 * testable without a database or network
 * (see scripts/test-buffer-publisher.ts).
 */

export type QueueStatus = "queued" | "publishing" | "published" | "failed";

export interface QueuedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: unknown[];
  keywords: string[];
  cover_image: string | null;
  publish_at: string;
  status: QueueStatus;
  attempts: number;
}

export type PublishOutcome =
  | "published"
  | "published_pending_live"
  | "already_published"
  | "already_claimed"
  | "publish_failed"
  | "admin_session_failed"
  | "noop";

export interface RunLogEntry {
  outcome: PublishOutcome | "status" | "admin_session_failed";
  queue_id: string | null;
  slug: string | null;
  deploy_hook_configured: boolean | null;
  live_verified: boolean | null;
  detail: string | null;
}

export interface QueueStore {
  /** Oldest due article (status 'queued', publish_at <= now), or null. */
  findNextDue(nowIso: string): Promise<QueuedArticle | null>;
  /** Claim one article ('queued' → 'publishing'); true only for the winner. */
  claim(id: string): Promise<boolean>;
  /** Release a claim without recording an attempt ('publishing' → 'queued'). */
  release(id: string): Promise<void>;
  /** Mark a claimed article published, recording the created post id. */
  complete(id: string, postId: string | null): Promise<void>;
  /** Record a failed publish attempt; terminal=true parks it as 'failed'. */
  fail(id: string, attempts: number, error: string, terminal: boolean): Promise<void>;
  /** Counts per queue status. */
  countByStatus(): Promise<Record<string, number>>;
  /** Next 'queued' article by publish_at, due or not. */
  nextQueued(): Promise<QueuedArticle | null>;
  /** Most recent publish-run log entry, or null. */
  lastRun(): Promise<Record<string, unknown> | null>;
  /** Append a run-log row; false when logging is unavailable. */
  logRun(entry: RunLogEntry): Promise<boolean>;
}

export interface AdminPublishResult {
  ok: boolean;
  httpStatus: number;
  postId: string | null;
  slug: string | null;
  /** The admin route rejected it: a post with this slug already exists. */
  duplicateSlug: boolean;
  /** The admin session could not be established; nothing was attempted. */
  sessionFailed?: boolean;
  error: string | null;
}

/** Publishes one article through the admin API (injected; faked in tests). */
export type PublishViaAdmin = (
  article: QueuedArticle
) => Promise<AdminPublishResult>;

/** Bounded live check of the article's public URL (injected; faked in tests). */
export type LiveCheck = (slug: string) => Promise<boolean>;

export interface PublishRunResult {
  outcome: PublishOutcome;
  article: QueuedArticle | null;
  admin: AdminPublishResult | null;
  liveVerified: boolean | null;
  runLogged: boolean;
}

export const MAX_PUBLISH_ATTEMPTS = 3;

/**
 * One publish pass: pick the oldest due article, claim it, publish it
 * via the admin API, verify the public URL, bookkeep. Publishes nothing
 * when nothing is due.
 */
export async function publishNextQueuedArticle(
  store: QueueStore,
  publishViaAdmin: PublishViaAdmin,
  liveCheck: LiveCheck,
  deployHookConfigured: boolean,
  now: Date = new Date()
): Promise<PublishRunResult> {
  const due = await store.findNextDue(now.toISOString());

  if (!due) {
    const runLogged = await store.logRun({
      outcome: "noop",
      queue_id: null,
      slug: null,
      deploy_hook_configured: deployHookConfigured,
      live_verified: null,
      detail: "No queued article was due.",
    });
    return { outcome: "noop", article: null, admin: null, liveVerified: null, runLogged };
  }

  const claimed = await store.claim(due.id);
  if (!claimed) {
    const runLogged = await store.logRun({
      outcome: "already_claimed",
      queue_id: due.id,
      slug: due.slug,
      deploy_hook_configured: deployHookConfigured,
      live_verified: null,
      detail: "Article was claimed by another run first; not published again.",
    });
    return {
      outcome: "already_claimed",
      article: due,
      admin: null,
      liveVerified: null,
      runLogged,
    };
  }

  const admin = await publishViaAdmin(due);

  if (admin.sessionFailed) {
    // Infrastructure failure, not the article's fault: release the
    // claim without burning an attempt and stop the run loudly.
    await store.release(due.id);
    const runLogged = await store.logRun({
      outcome: "admin_session_failed",
      queue_id: due.id,
      slug: due.slug,
      deploy_hook_configured: deployHookConfigured,
      live_verified: null,
      detail:
        "Could not establish an admin session server-side; nothing was published and no attempt was recorded.",
    });
    return {
      outcome: "admin_session_failed",
      article: due,
      admin,
      liveVerified: null,
      runLogged,
    };
  }

  if (admin.ok) {
    await store.complete(due.id, admin.postId);
    // The admin route fired triggerAutoDeploy itself; verify the result
    // on the public URL instead of assuming the deploy landed.
    const live = await liveCheck(due.slug);
    const outcome: PublishOutcome = live ? "published" : "published_pending_live";
    const runLogged = await store.logRun({
      outcome,
      queue_id: due.id,
      slug: due.slug,
      deploy_hook_configured: deployHookConfigured,
      live_verified: live,
      detail: live
        ? "Published via POST /api/admin/blog (admin session); public URL verified live."
        : "Published via POST /api/admin/blog (admin session); public URL not live yet within the check window (deploy may still be propagating).",
    });
    return { outcome, article: due, admin, liveVerified: live, runLogged };
  }

  if (admin.duplicateSlug) {
    // A previous run published this article but crashed before the
    // queue bookkeeping. Complete the row; never publish it again.
    await store.complete(due.id, admin.postId);
    const runLogged = await store.logRun({
      outcome: "already_published",
      queue_id: due.id,
      slug: due.slug,
      deploy_hook_configured: deployHookConfigured,
      live_verified: null,
      detail: "Admin API reports a post with this slug already exists; queue row completed without re-publishing.",
    });
    return {
      outcome: "already_published",
      article: due,
      admin,
      liveVerified: null,
      runLogged,
    };
  }

  const attempts = due.attempts + 1;
  const terminal = attempts >= MAX_PUBLISH_ATTEMPTS;
  const message = admin.error ?? `Admin publish failed (HTTP ${admin.httpStatus}).`;
  await store.fail(due.id, attempts, message, terminal);
  const runLogged = await store.logRun({
    outcome: "publish_failed",
    queue_id: due.id,
    slug: due.slug,
    deploy_hook_configured: deployHookConfigured,
    live_verified: null,
    detail: terminal
      ? `Attempt ${attempts}/${MAX_PUBLISH_ATTEMPTS} failed — parked as failed: ${message}`
      : `Attempt ${attempts}/${MAX_PUBLISH_ATTEMPTS} failed — will retry next run: ${message}`,
  });
  return {
    outcome: "publish_failed",
    article: due,
    admin,
    liveVerified: null,
    runLogged,
  };
}

interface SupabaseLike {
  from(table: string): any;
}

/** QueueStore backed by a Supabase client (service role in the cron). */
export function createSupabaseQueueStore(supabase: SupabaseLike): QueueStore {
  return {
    async findNextDue(nowIso: string) {
      const { data, error } = await supabase
        .from("blog_buffer_queue")
        .select("*")
        .eq("status", "queued")
        .lte("publish_at", nowIso)
        .order("publish_at", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`findNextDue failed: ${error.message}`);
      return (data as QueuedArticle | null) ?? null;
    },

    async claim(id: string) {
      const { data, error } = await supabase
        .from("blog_buffer_queue")
        .update({ status: "publishing", updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("status", "queued")
        .select("id");
      if (error) throw new Error(`claim failed: ${error.message}`);
      return Array.isArray(data) && data.length === 1;
    },

    async release(id: string) {
      const { error } = await supabase
        .from("blog_buffer_queue")
        .update({ status: "queued", updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("status", "publishing");
      if (error) throw new Error(`release failed: ${error.message}`);
    },

    async complete(id: string, postId: string | null) {
      const { error } = await supabase
        .from("blog_buffer_queue")
        .update({
          status: "published",
          published_post_id: postId,
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw new Error(`complete failed: ${error.message}`);
    },

    async fail(id: string, attempts: number, error: string, terminal: boolean) {
      const { error: dbError } = await supabase
        .from("blog_buffer_queue")
        .update({
          status: terminal ? "failed" : "queued",
          attempts,
          last_error: error.slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (dbError) throw new Error(`fail failed: ${dbError.message}`);
    },

    async countByStatus() {
      const { data, error } = await supabase
        .from("blog_buffer_queue")
        .select("status");
      if (error) throw new Error(`countByStatus failed: ${error.message}`);
      const counts: Record<string, number> = {};
      for (const row of (data ?? []) as { status: string }[]) {
        counts[row.status] = (counts[row.status] ?? 0) + 1;
      }
      return counts;
    },

    async nextQueued() {
      const { data, error } = await supabase
        .from("blog_buffer_queue")
        .select("*")
        .eq("status", "queued")
        .order("publish_at", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`nextQueued failed: ${error.message}`);
      return (data as QueuedArticle | null) ?? null;
    },

    async lastRun() {
      const { data, error } = await supabase
        .from("blog_publish_runs")
        .select("*")
        .order("run_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`lastRun failed: ${error.message}`);
      return (data as Record<string, unknown> | null) ?? null;
    },

    async logRun(entry: RunLogEntry) {
      const { error } = await supabase.from("blog_publish_runs").insert(entry);
      return !error;
    },
  };
}
