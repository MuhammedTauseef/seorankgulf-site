"use client";

import { useEffect, useState } from "react";

type Msg = { role: string; text: string };
type Conversation = {
  id: string;
  persona_name: string | null;
  messages: Msg[];
  created_at: string;
};

const PAGE_SIZE = 10;

/** /dashboard/client/conversations — own chat history (owner only). */
export default function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function load(nextOffset: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations?limit=${PAGE_SIZE}&offset=${nextOffset}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load.");
      setItems(data.conversations || []);
      setTotal(data.total || 0);
      setOffset(nextOffset);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, []);

  if (loading && items.length === 0) return <p style={{ color: "var(--muted)" }}>Loading conversations…</p>;
  if (error) return <p style={{ color: "#ef4444" }}>{error} <button onClick={() => load(0)}>Retry</button></p>;
  if (items.length === 0) return <p style={{ color: "var(--muted)" }}>No conversations yet. Try the live demo!</p>;

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <h2 style={{ margin: "0 0 6px" }}>Conversation history</h2>
      <p style={{ color: "var(--muted)", fontSize: ".9rem", margin: "0 0 8px" }}>
        {total} conversation{total === 1 ? "" : "s"} — only you can see these.
      </p>

      {items.map((c) => {
        const isOpen = open === c.id;
        const preview = c.messages.find((m) => m.role === "user")?.text || "—";
        return (
          <div key={c.id} className="admin-card">
            <button
              onClick={() => setOpen(isOpen ? null : c.id)}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong style={{ fontSize: ".95rem" }}>
                  {preview.slice(0, 80)}{preview.length > 80 ? "…" : ""}
                </strong>
                <span style={{ color: "var(--muted)", fontSize: ".85rem", whiteSpace: "nowrap" }}>
                  {new Date(c.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isOpen ? " ▲" : " ▼"}
                </span>
              </div>
              {c.persona_name && (
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>as {c.persona_name}</span>
              )}
            </button>
            {isOpen && (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {c.messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: m.role === "user" ? "rgba(245,158,11,.1)" : "rgba(255,255,255,.03)",
                      fontSize: ".9rem",
                    }}
                  >
                    <strong style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                      {m.role === "user" ? "You" : "AI"}:
                    </strong>{" "}
                    {m.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="btn-small"
          disabled={offset === 0 || loading}
          onClick={() => load(Math.max(0, offset - PAGE_SIZE))}
        >
          ← Newer
        </button>
        <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
        </span>
        <button
          className="btn-small"
          disabled={offset + PAGE_SIZE >= total || loading}
          onClick={() => load(offset + PAGE_SIZE)}
        >
          Older →
        </button>
      </div>
    </div>
  );
}
