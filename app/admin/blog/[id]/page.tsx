"use client";


import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BlogEditor, { type Block } from "@/components/BlogEditor";
import ImageUploadButton from "@/components/ImageUploadButton";

/** /admin/blog/[id] — edit an existing post. */
function EditPostForm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [keywords, setKeywords] = useState("");
  const [cover, setCover] = useState("");
  const [published, setPublished] = useState(true);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.post) {
          setError("Post not found.");
          setLoading(false);
          return;
        }
        const p = d.post;
        setTitle(p.title || "");
        setSlug(p.slug || "");
        setExcerpt(p.excerpt || "");
        setKeywords((p.keywords || []).join(", "));
        setCover(p.cover_image || "");
        setPublished(p.published !== false);
        setBlocks(Array.isArray(p.content) ? p.content : []);
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
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: newBlocks,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
          cover_image: cover.trim(),
          published,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)", fontSize: ".95rem",
    marginBottom: 12, boxSizing: "border-box",
  };

  async function onDelete() {
    if (!window.confirm(`Delete "${title || "this post"}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      router.push("/admin/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setSaving(false);
    }
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/blog" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
          ← All posts
        </Link>
        <button
          onClick={onDelete}
          disabled={saving}
          style={{ color: "#b3261e", background: "none", border: "1px solid #b3261e", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: ".85rem", fontWeight: 600 }}
        >
          Delete post
        </button>
      </div>
      <h1 style={{ margin: "12px 0 20px" }}>Edit post</h1>

      {error && <p style={{ color: "#b3261e" }}>{error}</p>}

      <input style={input} placeholder="Post title *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input style={input} placeholder="URL slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <textarea style={{ ...input, minHeight: 70 }} placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      <input style={input} placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      <input style={input} placeholder="Cover image URL" value={cover} onChange={(e) => setCover(e.target.value)} />
      <ImageUploadButton onUploaded={setCover} label="📤 Upload cover image" />
      {cover.trim() && (
        <img
          src={cover.trim()}
          alt="cover preview"
          style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 8, marginBottom: 12 }}
        />
      )}
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>

      <h3>Content</h3>
      {blocks !== null && <BlogEditor initial={blocks} onSave={onSave} saving={saving} />}
    </main>
  );
}

/** Wrapper with Suspense boundary for static prerendering. */
export default function EditPostPage() {
  return (
    <Suspense fallback={<main className="admin-wrap"><p>Loading…</p></main>}>
      <EditPostForm />
    </Suspense>
  );
}
