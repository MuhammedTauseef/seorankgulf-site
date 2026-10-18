"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BlogEditor, { type Block } from "@/components/BlogEditor";

/** /admin/pages/[slug] — edit a static page. */
function EditPageForm() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(true);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/pages?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.page) {
          setError("Page not found.");
        } else {
          setTitle(d.page.title || "");
          setPublished(d.page.published !== false);
          setBlocks(Array.isArray(d.page.content) ? d.page.content : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load.");
        setLoading(false);
      });
  }, [slug]);

  async function onSaveBlocks(newBlocks: Block[]) {
    setBlocks(newBlocks);
    // Save immediately when editor saves
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title: title.trim(), content: newBlocks, published }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/pages");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)", fontSize: ".95rem",
    marginBottom: 12, boxSizing: "border-box",
  };

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link href="/admin/pages" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
        ← All pages
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>Edit page: /{slug}</h1>
      {error && <p style={{ color: "#b3261e" }}>{error}</p>}
      <input style={input} placeholder="Page title *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>
      {blocks !== null && (
        <BlogEditor initial={blocks} onSave={onSaveBlocks} saving={saving} />
      )}
    </main>
  );
}

/** Wrapper with Suspense boundary for static prerendering. */
export default function EditPagePage() {
  return (
    <Suspense fallback={<main className="admin-wrap"><p>Loading…</p></main>}>
      <EditPageForm />
    </Suspense>
  );
}
