"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

interface Row {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  created_at: string;
}

/** /admin/blog — manage blog posts: new, edit, delete, publish toggle. */
export default function AdminBlogPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  async function onDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete.");
      return;
    }
    load();
  }

  async function togglePublish(row: Row) {
    // Fetch full post first so we don't wipe content on toggle.
    const full = await fetch(`/api/admin/blog/${row.id}`).then((r) => r.json()).catch(() => null);
    if (!full?.post) {
      alert("Could not load post.");
      return;
    }
    const res = await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...full.post, published: !row.published }),
    });
    if (!res.ok) alert("Could not update.");
    else load();
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Blog posts</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Write, edit, publish and delete articles.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Dashboard
          </Link>
          <Link
            href="/admin/blog/new"
            style={{ background: "#E63946", color: "#ffffff", padding: "10px 20px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}
          >
            + New post
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">No posts yet. Click “New post” to write your first article.</div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong></td>
                <td style={{ fontSize: ".85rem", color: "#6b7280" }}>/blog/{r.slug}</td>
                <td>
                  <button
                    onClick={() => togglePublish(r)}
                    style={{
                      background: r.published ? "#16a34a1a" : "#6b72801a",
                      color: r.published ? "#16a34a" : "#6b7280",
                      border: "none", borderRadius: 20, padding: "4px 12px",
                      fontSize: ".8rem", fontWeight: 700, cursor: "pointer",
                    }}
                    title="Toggle publish"
                  >
                    {r.published ? "Published" : "Draft"}
                  </button>
                </td>
                <td style={{ whiteSpace: "nowrap", fontSize: ".85rem" }}>
                  {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <Link href={`/admin/blog/${r.id}`} style={{ marginRight: 12 }}>Edit</Link>
                  <button onClick={() => onDelete(r.id, r.title)} style={{ color: "#b3261e", background: "none", border: "none", cursor: "pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
