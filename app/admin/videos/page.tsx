"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

interface Row {
  id: string;
  file: string;
  niche: string;
  channel: string;
  title: string;
  published: boolean;
  sort_order: number;
}

/** /admin/videos — manage demo videos: add, edit, delete, publish toggle. */
export default function AdminVideosPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/videos")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.videos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  async function onDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/videos?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete.");
      return;
    }
    load();
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Videos</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Demo videos shown on the /videos page.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Dashboard
          </Link>
          <Link
            href="/admin/videos/new"
            style={{ background: "#f59e0b", color: "#111827", padding: "10px 20px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}
          >
            + New video
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">No videos yet.</div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Niche</th>
              <th>Channel</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong><br /><span style={{ fontSize: ".8rem", color: "#6b7280" }}>{r.file}</span></td>
                <td>{r.niche || "—"}</td>
                <td>{r.channel || "—"}</td>
                <td style={{ color: r.published ? "#16a34a" : "#6b7280", fontWeight: 700, fontSize: ".85rem" }}>
                  {r.published ? "Published" : "Draft"}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <Link href={`/admin/videos/${r.id}`} style={{ marginRight: 12 }}>Edit</Link>
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
