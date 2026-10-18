"use client";

import { useEffect, useState } from "react";

type Faq = {
  id: string;
  question: string;
  answer: string;
  published: boolean;
  sort_order: number;
};

export default function FaqsClient() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load FAQs.");
      setFaqs(data.faqs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditing(null);
    setQ("");
    setA("");
    setPublished(true);
  }

  function startEdit(f: Faq) {
    setEditing(f);
    setQ(f.question);
    setA(f.answer);
    setPublished(f.published);
  }

  async function save() {
    if (!q.trim() || !a.trim()) {
      alert("Question and answer are required.");
      return;
    }
    setBusy(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const res = await fetch("/api/admin/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing
            ? { id: editing.id, question: q, answer: a, published }
            : { question: q, answer: a, published }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      if (editing) {
        setFaqs((prev) => prev.map((f) => (f.id === editing.id ? data.faq : f)));
      } else {
        setFaqs((prev) => [data.faq, ...prev]);
      }
      startNew();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(f: Faq) {
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: f.id, published: !f.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      setFaqs((prev) => prev.map((x) => (x.id === f.id ? data.faq : x)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed.");
    }
  }

  async function remove(f: Faq) {
    if (!confirm(`Delete this FAQ?\n\n"${f.question}"`)) return;
    try {
      const res = await fetch(`/api/admin/faqs?id=${encodeURIComponent(f.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setFaqs((prev) => prev.filter((x) => x.id !== f.id));
      if (editing?.id === f.id) startNew();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading FAQs…</p>;
  if (error) return <p style={{ color: "#ef4444" }}>{error} <button onClick={load}>Retry</button></p>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="admin-card">
        <h3>{editing ? "Edit FAQ" : "New FAQ"}</h3>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <input
            className="admin-input"
            placeholder="Question"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={500}
          />
          <textarea
            className="admin-input"
            placeholder="Answer"
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={4}
            maxLength={5000}
          />
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: ".9rem" }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published (visible on website)
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" disabled={busy} onClick={save}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add FAQ"}
            </button>
            {editing && (
              <button className="btn-small" onClick={startNew}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {faqs.length === 0 && (
          <p style={{ color: "var(--muted)" }}>No FAQs yet. Add the first one above.</p>
        )}
        {faqs.map((f) => (
          <div key={f.id} className="admin-card" style={{ opacity: f.published ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
              <div>
                <strong>{f.question}</strong>
                <p style={{ color: "var(--muted)", fontSize: ".9rem", margin: "6px 0 0" }}>
                  {f.answer.slice(0, 200)}{f.answer.length > 200 ? "…" : ""}
                </p>
                <span className={`badge ${f.published ? "badge-gold" : ""}`} style={{ marginTop: 8, display: "inline-block" }}>
                  {f.published ? "Published" : "Draft"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, whiteSpace: "nowrap" }}>
                <button className="btn-small" onClick={() => startEdit(f)}>Edit</button>
                <button className="btn-small" onClick={() => togglePublish(f)}>
                  {f.published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn-small btn-danger" onClick={() => remove(f)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
