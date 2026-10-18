"use client";

import { useState } from "react";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "img"; src: string; alt: string };

/** Block-based blog post editor: paragraphs, headings, lists, images. */
export default function BlogEditor({
  initial,
  onSave,
  saving,
}: {
  initial: Block[];
  onSave: (blocks: Block[]) => void;
  saving: boolean;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial);

  const update = (i: number, b: Block) => {
    const next = [...blocks];
    next[i] = b;
    setBlocks(next);
  };
  const remove = (i: number) => setBlocks(blocks.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };
  const add = (type: Block["type"]) => {
    const b: Block =
      type === "ul"
        ? { type: "ul", items: [""] }
        : type === "img"
          ? { type: "img", src: "", alt: "" }
          : { type, text: "" };
    setBlocks([...blocks, b]);
  };

  const box: React.CSSProperties = {
    border: "1px solid var(--border, #e2e2e2)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    background: "var(--card, #fff)",
  };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)",
    fontSize: ".95rem",
    marginBottom: 8,
    boxSizing: "border-box",
  };

  return (
    <div>
      {blocks.map((b, i) => (
        <div key={i} style={box}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: ".8rem", textTransform: "uppercase", color: "#6b7280" }}>
              {b.type === "p" ? "Paragraph" : b.type === "h2" ? "Heading" : b.type === "ul" ? "List" : "Image"}
            </strong>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} title="Move down">↓</button>
              <button type="button" onClick={() => remove(i)} style={{ color: "#b3261e" }} title="Remove">✕</button>
            </div>
          </div>

          {b.type === "img" ? (
            <>
              <input
                style={input}
                placeholder="Image URL (e.g. /blog/my-photo.jpg)"
                value={b.src}
                onChange={(e) => update(i, { ...b, src: e.target.value })}
              />
              <input
                style={input}
                placeholder="Alt text (describe the image for SEO)"
                value={b.alt}
                onChange={(e) => update(i, { ...b, alt: e.target.value })}
              />
            </>
          ) : b.type === "ul" ? (
            <>
              {b.items.map((item, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input
                    style={{ ...input, marginBottom: 0 }}
                    placeholder={`Bullet ${j + 1}`}
                    value={item}
                    onChange={(e) => {
                      const items = [...b.items];
                      items[j] = e.target.value;
                      update(i, { ...b, items });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => update(i, { ...b, items: b.items.filter((_, k) => k !== j) })}
                    style={{ color: "#b3261e" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => update(i, { ...b, items: [...b.items, ""] })}>
                + Add bullet
              </button>
            </>
          ) : (
            <textarea
              style={{ ...input, minHeight: b.type === "h2" ? 44 : 90 }}
              placeholder={b.type === "h2" ? "Heading text" : "Paragraph text"}
              value={b.text}
              onChange={(e) => update(i, { ...b, text: e.target.value })}
            />
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button type="button" onClick={() => add("h2")}>+ Heading</button>
        <button type="button" onClick={() => add("p")}>+ Paragraph</button>
        <button type="button" onClick={() => add("ul")}>+ List</button>
        <button type="button" onClick={() => add("img")}>+ Image</button>
      </div>

      <button
        type="button"
        onClick={() => onSave(blocks)}
        disabled={saving}
        style={{
          background: "#f59e0b",
          color: "#111827",
          padding: "12px 32px",
          borderRadius: 10,
          fontWeight: 700,
          border: "none",
          cursor: saving ? "wait" : "pointer",
        }}
      >
        {saving ? "Saving…" : "Save post"}
      </button>
    </div>
  );
}
