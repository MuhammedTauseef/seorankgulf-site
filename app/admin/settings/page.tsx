"use client";


import { useEffect, useState } from "react";
import Link from "next/link";

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface Faq {
  question: string;
  answer: string;
  published: boolean;
}

/** /admin/settings — site settings + FAQ management. */
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || []);
        const v: Record<string, string> = {};
        for (const s of d.settings || []) v[s.key] = s.value;
        setValues(v);
        setFaqs((d.faqs || []).map((f: Faq) => ({ ...f })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function onSave() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: values,
          faqs: faqs.map((f, i) => ({ ...f, sort_order: i })),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed.");
    }
    setSaving(false);
  }

  function moveFaq(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= faqs.length) return;
    const next = [...faqs];
    [next[i], next[j]] = [next[j], next[i]];
    setFaqs(next);
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)", fontSize: ".95rem",
    marginBottom: 16, boxSizing: "border-box",
  };

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <div className="admin-top">
        <h1>Site settings</h1>
        <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
          ← Dashboard
        </Link>
      </div>

      <h2 style={{ fontSize: "1.1rem", margin: "24px 0 12px" }}>General</h2>
      {settings.map((s) => (
        <div key={s.key}>
          <label style={{ display: "block", fontSize: ".85rem", fontWeight: 600, marginBottom: 4, color: "var(--muted)" }}>
            {s.label || s.key}
          </label>
          {s.value.length > 120 || s.key.includes("headline") || s.key.includes("sub") ? (
            <textarea
              style={{ ...input, minHeight: 70 }}
              value={values[s.key] || ""}
              onChange={(e) => setValues((p) => ({ ...p, [s.key]: e.target.value }))}
            />
          ) : (
            <input
              style={input}
              value={values[s.key] || ""}
              onChange={(e) => setValues((p) => ({ ...p, [s.key]: e.target.value }))}
            />
          )}
        </div>
      ))}

      <h2 style={{ fontSize: "1.1rem", margin: "24px 0 12px" }}>FAQs</h2>
      {faqs.map((f, i) => (
        <div key={i} style={{ border: "1px solid var(--border, #e2e2e2)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <input
            style={input}
            placeholder="Question"
            value={f.question}
            onChange={(e) => setFaqs((p) => p.map((x, j) => j === i ? { ...x, question: e.target.value } : x))}
          />
          <textarea
            style={{ ...input, minHeight: 70, marginBottom: 8 }}
            placeholder="Answer"
            value={f.answer}
            onChange={(e) => setFaqs((p) => p.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))}
          />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: ".85rem" }}>
              <input
                type="checkbox"
                checked={f.published}
                onChange={(e) => setFaqs((p) => p.map((x, j) => j === i ? { ...x, published: e.target.checked } : x))}
              />
              Published
            </label>
            <button type="button" onClick={() => moveFaq(i, -1)} disabled={i === 0} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>↑</button>
            <button type="button" onClick={() => moveFaq(i, 1)} disabled={i === faqs.length - 1} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>↓</button>
            <button type="button" onClick={() => setFaqs((p) => p.filter((_, j) => j !== i))} style={{ color: "#b3261e", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setFaqs((p) => [...p, { question: "", answer: "", published: true }])}
        style={{ background: "none", border: "1px dashed #999", borderRadius: 8, padding: "10px 20px", cursor: "pointer", marginBottom: 24 }}
      >
        + Add FAQ
      </button>

      <div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{ background: "#f59e0b", color: "#111827", padding: "12px 32px", borderRadius: 10, fontWeight: 700, border: "none", cursor: saving ? "wait" : "pointer" }}
        >
          {saving ? "Saving…" : "Save all"}
        </button>
        {msg && <span style={{ marginLeft: 12, color: msg === "Saved." ? "#16a34a" : "#b3261e" }}>{msg}</span>}
      </div>
    </main>
  );
}
