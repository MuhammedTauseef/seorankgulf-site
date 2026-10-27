import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import DeleteQueueButton from "./DeleteQueueButton";

type QueueRow = {
  id: string;
  slug: string;
  title: string;
  publish_at: string;
  status: "queued" | "publishing" | "published" | "failed";
  attempts: number;
  last_error: string | null;
};

type RunRow = {
  id: string;
  run_at: string;
  outcome: string;
  slug: string | null;
  detail: string | null;
};

/** All dates on this page are shown in Pakistan Time and labelled PKT. */
function formatPKT(iso: string): string {
  try {
    return (
      new Date(iso).toLocaleString("en-GB", {
        timeZone: "Asia/Karachi",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " PKT"
    );
  } catch {
    return iso;
  }
}

const STATUS_STYLE: Record<QueueRow["status"], { bg: string; fg: string }> = {
  queued: { bg: "#f59e0b1a", fg: "#92400e" },
  publishing: { bg: "#3b82f61a", fg: "#1d4ed8" },
  published: { bg: "#16a34a1a", fg: "#16a34a" },
  failed: { bg: "#dc26261a", fg: "#b3261e" },
};

function StatusBadge({ status }: { status: QueueRow["status"] }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        borderRadius: 20,
        padding: "4px 12px",
        fontSize: ".8rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function QueueTable({ rows }: { rows: QueueRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        Queue is empty — no articles are waiting.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Slug</th>
          <th>Publish at</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>
              <strong>{r.title}</strong>
              {r.status === "failed" && r.last_error && (
                <span
                  style={{
                    display: "block",
                    color: "#b3261e",
                    fontSize: ".82rem",
                    marginTop: 4,
                  }}
                >
                  {r.last_error}
                </span>
              )}
            </td>
            <td style={{ fontSize: ".85rem", color: "#6b7280" }}>
              /blog/{r.slug}
            </td>
            <td style={{ whiteSpace: "nowrap" }}>{formatPKT(r.publish_at)}</td>
            <td>
              <StatusBadge status={r.status} />
              {r.attempts > 0 && (
                <span
                  style={{
                    display: "block",
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    marginTop: 4,
                  }}
                >
                  {r.attempts} attempt{r.attempts === 1 ? "" : "s"}
                </span>
              )}
            </td>
            <td style={{ whiteSpace: "nowrap" }}>
              {r.status === "queued" ? (
                <>
                  <Link
                    href={`/admin/buffer/${r.id}`}
                    style={{ marginRight: 12 }}
                  >
                    Edit
                  </Link>
                  <DeleteQueueButton id={r.id} title={r.title} />
                </>
              ) : (
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                  —
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RunsTable({ rows }: { rows: RunRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No publisher runs recorded yet. Runs will appear here after the
        auto-publisher&apos;s first pass.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Run at</th>
          <th>Outcome</th>
          <th>Slug</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td style={{ whiteSpace: "nowrap" }}>{formatPKT(r.run_at)}</td>
            <td style={{ fontWeight: 600 }}>{r.outcome}</td>
            <td style={{ fontSize: ".85rem", color: "#6b7280" }}>
              {r.slug ? `/blog/${r.slug}` : "—"}
            </td>
            <td className="msg">{r.detail || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Session-gated content — same pattern as /admin: the proxy already
 * restricts /admin/* to admins, and this double-checks the session.
 */
async function BufferContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [queueRes, runsRes] = await Promise.all([
    supabase
      .from("blog_buffer_queue")
      .select("id, slug, title, publish_at, status, attempts, last_error")
      .in("status", ["queued", "publishing", "failed"])
      .order("publish_at", { ascending: true }),
    supabase
      .from("blog_publish_runs")
      .select("id, run_at, outcome, slug, detail")
      .order("run_at", { ascending: false })
      .limit(14),
  ]);

  const queueRows = (queueRes.data ?? []) as QueueRow[];
  const runRows = (runsRes.data ?? []) as RunRow[];
  const queuedCount = queueRows.filter((r) => r.status === "queued").length;

  return (
    <>
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Waiting articles
        </h2>
        <p
          style={{
            color: "var(--muted)",
            fontSize: ".92rem",
            margin: "0 0 18px",
          }}
        >
          {queuedCount} article{queuedCount === 1 ? "" : "s"} waiting for the
          auto-publisher, soonest first. Only waiting (queued) articles can
          be edited, rescheduled or removed here.
        </p>
        {queueRes.error ? (
          <div className="empty">
            Could not load the queue. Check the database setup (see
            supabase/blog-buffer-publisher.sql).
          </div>
        ) : (
          <QueueTable rows={queueRows} />
        )}
      </section>

      <section>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Recent publisher runs
        </h2>
        <p
          style={{
            color: "var(--muted)",
            fontSize: ".92rem",
            margin: "0 0 18px",
          }}
        >
          The auto-publisher&apos;s latest activity, newest first.
        </p>
        {runsRes.error ? (
          <div className="empty">Could not load the run history.</div>
        ) : (
          <RunsTable rows={runRows} />
        )}
      </section>
    </>
  );
}

/** /admin/buffer — buffer queue visibility + queued-item management. */
export default function BufferPage() {
  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Buffer Queue</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Articles waiting for the auto-publisher, and its recent runs.
            All times are Pakistan Time (PKT).
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/admin"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
              fontSize: ".9rem",
            }}
          >
            ← Dashboard
          </Link>
          <Link
            href="/admin/blog"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
              fontSize: ".9rem",
            }}
          >
            Blog posts →
          </Link>
          <LogoutButton />
        </div>
      </div>

      <Suspense fallback={<div className="empty">Loading buffer queue…</div>}>
        <BufferContent />
      </Suspense>
    </main>
  );
}
