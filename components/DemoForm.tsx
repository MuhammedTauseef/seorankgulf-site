"use client";

import { useState } from "react";

export interface DemoForm {
  tag: string;
  name: string;
  slug: string;
  text: string;
  group_name: string;
  business: string;
  blurb: string;
  welcome: string;
  published: boolean;
  sort_order: number;
}

export const emptyDemoForm: DemoForm = {
  tag: "",
  name: "",
  slug: "",
  text: "",
  group_name: "website",
  business: "",
  blurb: "",
  welcome: "",
  published: true,
  sort_order: 0,
};

/** Shared demo form for new + edit pages. */
export default function DemoFormFields({
  initial,
  onSave,
  saving,
  isNew,
}: {
  initial: DemoForm;
  onSave: (v: DemoForm) => void;
  saving: boolean;
  isNew: boolean;
}) {
  const [f, setF] = useState<DemoForm>(initial);
  const set = (k: keyof DemoForm, v: string | boolean | number) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)", fontSize: ".95rem",
    marginBottom: 12, boxSizing: "border-box",
  };
  const label: React.CSSProperties = {
    display: "block", fontSize: ".85rem", fontWeight: 600,
    marginBottom: 4, color: "var(--muted)",
  };

  return (
    <div>
      <label style={label}>Business name *</label>
      <input style={input} placeholder="e.g. Velvet & Vine" value={f.name} onChange={(e) => set("name", e.target.value)} />

      {isNew && (
        <>
          <label style={label}>Slug * (URL, lowercase)</label>
          <input style={input} placeholder="e.g. velvet-vine" value={f.slug} onChange={(e) => set("slug", e.target.value)} />
        </>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Niche tag</label>
          <input style={input} placeholder="e.g. Boutique" value={f.tag} onChange={(e) => set("tag", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Channel</label>
          <select style={input} value={f.group_name} onChange={(e) => set("group_name", e.target.value)}>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      <label style={label}>Short description</label>
      <input style={input} placeholder="What the demo shows" value={f.text} onChange={(e) => set("text", e.target.value)} />

      <label style={label}>Business description (AI persona)</label>
      <input style={input} placeholder="e.g. a women's fashion boutique" value={f.business} onChange={(e) => set("business", e.target.value)} />

      <label style={label}>Persona blurb (tone, offerings — guides the AI)</label>
      <textarea style={{ ...input, minHeight: 90 }} placeholder="You sell curated dresses... Tone: warm, stylish, helpful." value={f.blurb} onChange={(e) => set("blurb", e.target.value)} />

      <label style={label}>Welcome message</label>
      <input style={input} placeholder="Hi, welcome to..." value={f.welcome} onChange={(e) => set("welcome", e.target.value)} />

      <label style={label}>Sort order</label>
      <input style={input} type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />

      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
        Published
      </label>

      <button
        type="button"
        onClick={() => onSave(f)}
        disabled={saving}
        style={{ background: "#f59e0b", color: "#111827", padding: "12px 32px", borderRadius: 10, fontWeight: 700, border: "none", cursor: saving ? "wait" : "pointer" }}
      >
        {saving ? "Saving…" : "Save demo"}
      </button>
    </div>
  );
}
