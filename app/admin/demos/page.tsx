"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

interface Row {
  id: string;
  tag: string;
  name: string;
  slug: string;
  group_name: string;
  published: boolean;
}

/** /admin/demos — manage AI demo agents: add, edit, delete, publish toggle. */
export default function AdminDemosPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/demos")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.demos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`Delete demo "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/demos?id=${id}`, { method: "DELETE" });
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
          <h1>Demo agents</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            The 13 AI demo personas on /demo.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Dashboard
          </Link>
          <Link
            href="/admin/demos/new"
            style={{ background: "#E63946", color: "#ffffff", padding: "10px 20px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}
          >
            + New demo
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">No demos yet.</div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Niche</th>
              <th>Channel</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong><br /><span style={{ fontSize: ".8rem", color: "#6b7280" }}>/{r.slug}</span></td>
                <td>{r.tag || "—"}</td>
                <td style={{ textTransform: "capitalize" }}>{r.group_name}</td>
                <td style={{ color: r.published ? "#16a34a" : "#6b7280", fontWeight: 700, fontSize: ".85rem" }}>
                  {r.published ? "Published" : "Draft"}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <Link href={`/admin/demos/${r.id}`} style={{ marginRight: 12 }}>Edit</Link>
                  <button onClick={() => onDelete(r.id, r.name)} style={{ color: "#b3261e", background: "none", border: "none", cursor: "pointer" }}>
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
