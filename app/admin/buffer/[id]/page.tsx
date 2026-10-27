"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BlogEditor, { type Block } from "@/components/BlogEditor";
import ImageUploadButton from "@/components/ImageUploadButton";

/**
 * /admin/buffer/[id] — edit one QUEUED buffer item: title, slug,
 * excerpt, keywords, cover image, full content (same BlogEditor block
 * format as /admin/blog) and its scheduled publish date/time.
 *
 * Only 'queued' items can be edited — the API (PUT
 * /api/admin/blog/queue, lib/buffer-queue.ts) refuses every other
 * status, and this page does not render the form for them either.
 *
 * Times: publish_at is stored as a UTC instant; the picker shows and
 * accepts Pakistan Time (Asia/Karachi, UTC+5 year-round, no DST).
 */

/** ISO instant → 'YYYY-MM-DDTHH:mm' wall-clock in PKT for datetime-local. */
function isoToPktInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pkt = new Date(d.getTime() + 5 * 60 * 60 * 1000);
  return pkt.toISOString().slice(0, 16);
}

/** PKT wall-clock from datetime-local → ISO instant. */
function pktInputToIso(v: string): string {
  return new Date(`${v}:00+05:00`).toISOString();
}

function EditQueueForm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [keywords, setKeywords] = useState("");
  const [cover, setCover] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/queue?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.item) {
          setError(d.error || "Queue item not found.");
          setLoading(false);
          return;
        }
        const it = d.item;
        setStatus(it.status || "");
        setTitle(it.title || "");
        setSlug(it.slug || "");
        setExcerpt(it.excerpt || "");
        setKeywords((it.keywords || []).join(", "));
        setCover(it.cover_image || "");
        setPublishAt(it.publish_at ? isoToPktInput(it.publish_at) : "");
        setBlocks(Array.isArray(it.content) ? it.content : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load.");
        setLoading(false);
      });
  }, [id]);

  async function onSave(newBlocks: Block[]) {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!publishAt) {
      setError("Publish date/time is required.");
      return;
    }
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/blog/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: newBlocks,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          cover_image: cover.trim(),
          publish_at: pktInputToIso(publishAt),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      setSavedMsg("Saved — the article stays queued with the new details.");
      setSaving(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (
      !window.confirm(
        `Remove "${title || "this article"}" from the buffer queue? This cannot be undone.`
      )
    )
      return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/blog/queue?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Delete failed.");
      router.push("/admin/buffer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setSaving(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)",
    fontSize: ".95rem",
    marginBottom: 12,
    boxSizing: "border-box",
  };
  const label: React.CSSProperties = {
    display: "block",
    fontSize: ".85rem",
    fontWeight: 600,
    marginBottom: 4,
    color: "var(--muted)",
  };

  if (loading)
    return (
      <main className="admin-wrap">
        <p>Loading…</p>
      </main>
    );

  if (!blocks && error)
    return (
      <main className="admin-wrap" style={{ maxWidth: 800 }}>
        <Link
          href="/admin/buffer"
          style={{
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: ".9rem",
          }}
        >
          ← Buffer Queue
        </Link>
        <h1 style={{ margin: "12px 0 20px" }}>Edit queued article</h1>
        <p style={{ color: "#b3261e" }}>{error}</p>
      </main>
    );

  if (status !== "queued")
    return (
      <main className="admin-wrap" style={{ maxWidth: 800 }}>
        <Link
          href="/admin/buffer"
          style={{
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: ".9rem",
          }}
        >
          ← Buffer Queue
        </Link>
        <h1 style={{ margin: "12px 0 20px" }}>Edit queued article</h1>
        <div className="empty">
          This item is <strong>{status || "unknown"}</strong> and cannot be
          edited here. Only waiting (queued) articles can be edited,
          rescheduled or removed in the buffer queue
          {status === "published"
            ? " — published articles are edited under Blog posts."
            : "."}
        </div>
      </main>
    );

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/admin/buffer"
          style={{
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: ".9rem",
          }}
        >
          ← Buffer Queue
        </Link>
        <button
          onClick={onDelete}
          disabled={saving}
          style={{
            color: "#b3261e",
            background: "none",
            border: "1px solid #b3261e",
            borderRadius: 8,
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: ".85rem",
            fontWeight: 600,
          }}
        >
          Delete from queue
        </button>
      </div>
      <h1 style={{ margin: "12px 0 20px" }}>Edit queued article</h1>

      {error && <p style={{ color: "#b3261e" }}>{error}</p>}
      {savedMsg && (
        <p
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: "#ecfdf5",
            color: "#047857",
            fontWeight: 600,
          }}
        >
          ✓ {savedMsg}
        </p>
      )}

      <label style={label}>Title *</label>
      <input
        style={input}
        placeholder="Post title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label style={label}>URL slug</label>
      <input
        style={input}
        placeholder="URL slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <label style={label}>Excerpt</label>
      <textarea
        style={{ ...input, minHeight: 70 }}
        placeholder="Excerpt — short summary for SEO & previews"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />
      <label style={label}>Keywords (comma separated)</label>
      <input
        style={input}
        placeholder="Keywords (comma separated)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />
      <label style={label}>Cover image URL</label>
      <input
        style={input}
        placeholder="Cover image URL"
        value={cover}
        onChange={(e) => setCover(e.target.value)}
      />
      <ImageUploadButton onUploaded={setCover} label="📤 Upload cover image" />
      {cover.trim() && (
        <img
          src={cover.trim()}
          alt="cover preview"
          style={{
            maxWidth: "100%",
            maxHeight: 220,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
      )}
      <label style={label}>Publish at (PKT — Pakistan Time)</label>
      <input
        style={input}
        type="datetime-local"
        value={publishAt}
        onChange={(e) => setPublishAt(e.target.value)}
      />
      <p
        style={{
          color: "var(--muted)",
          fontSize: ".82rem",
          margin: "-4px 0 20px",
        }}
      >
        Changing this reschedules the article. The auto-publisher publishes
        it at this Pakistan time. Everything on this page — details, schedule
        and content — is saved together with the Save button below.
      </p>

      <h3>Content</h3>
      {blocks !== null && (
        <BlogEditor initial={blocks} onSave={onSave} saving={saving} />
      )}
    </main>
  );
}

/** Wrapper with Suspense boundary for static prerendering. */
export default function EditQueueItemPage() {
  return (
    <Suspense
      fallback={
        <main className="admin-wrap">
          <p>Loading…</p>
        </main>
      }
    >
      <EditQueueForm />
    </Suspense>
  );
}
