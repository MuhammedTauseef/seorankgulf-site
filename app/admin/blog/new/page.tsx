"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlogEditor, { type Block } from "@/components/BlogEditor";

/** /admin/blog/new — write a new post with the block editor. */
export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [keywords, setKeywords] = useState("");
  const [cover, setCover] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave(blocks: Block[]) {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: blocks,
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

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link href="/admin/blog" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
        ← All posts
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>New post</h1>

      {error && <p style={{ color: "#b3261e" }}>{error}</p>}

      <input style={input} placeholder="Post title *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input style={input} placeholder="URL slug (auto from title if empty)" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <textarea style={{ ...input, minHeight: 70 }} placeholder="Excerpt — short summary for SEO & previews" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      <input style={input} placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      <input style={input} placeholder="Cover image URL (optional)" value={cover} onChange={(e) => setCover(e.target.value)} />
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published (uncheck to save as draft)
      </label>

      <h3>Content</h3>
      <BlogEditor initial={[]} onSave={onSave} saving={saving} />
    </main>
  );
}
