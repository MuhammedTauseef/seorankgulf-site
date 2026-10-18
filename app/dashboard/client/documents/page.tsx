"use client";

import { useEffect, useState } from "react";

interface Doc {
  id: string;
  filename: string;
  created_at: string;
}

/** /dashboard/client/documents — knowledge base document upload. */
export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    fetch("/api/kb")
      .then((r) => r.json())
      .then((d) => d.documents && setDocs(d.documents))
      .catch(() => {});
  };

  useEffect(load, []);

  const upload = async () => {
    if (!text.trim() || !filename.trim() || uploading) return;
    setUploading(true);
    setMessage("");
    try {
      const res = await fetch("/api/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: filename.trim(), content: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setMessage("✅ Document added! Your agent can now answer from it.");
      setText("");
      setFilename("");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/kb?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <span className="eyebrow">Knowledge Base</span>
          <h1 className="display" style={{ fontSize: "2rem", marginBottom: 8 }}>
            Teach your agent
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 28 }}>
            Paste your price lists, policies, FAQs, or any business info. Your AI agent
            will answer customers using these documents.
          </p>

          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 20, marginBottom: 32 }}>
            <input
              placeholder="Document name (e.g. Price List 2026)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 12, fontSize: "1rem" }}
            />
            <textarea
              placeholder="Paste your document content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: "100%", minHeight: 160, padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 12, fontSize: "1rem" }}
            />
            <button
              onClick={upload}
              disabled={uploading || !text.trim() || !filename.trim()}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "#f59e0b", fontWeight: 700, cursor: "pointer" }}
            >
              {uploading ? "Adding..." : "Add document"}
            </button>
            {message && <p style={{ marginTop: 12 }}>{message}</p>}
          </div>

          <h2 style={{ fontSize: "1.3rem", marginBottom: 16 }}>Your documents ({docs.length})</h2>
          {docs.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>No documents yet. Add your first one above!</p>
          ) : (
            docs.map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 8 }}>
                <span>📄 {d.filename}</span>
                <button onClick={() => remove(d.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
