"use client";

import { useState } from "react";

export interface VideoForm {
  file: string;
  poster: string;
  niche: string;
  channel: string;
  title: string;
  description: string;
  published: boolean;
  sort_order: number;
}

export const emptyVideoForm: VideoForm = {
  file: "",
  poster: "",
  niche: "",
  channel: "",
  title: "",
  description: "",
  published: true,
  sort_order: 0,
};

/** Shared video form for new + edit pages. */
export default function VideoFormFields({
  initial,
  onSave,
  saving,
}: {
  initial: VideoForm;
  onSave: (v: VideoForm) => void;
  saving: boolean;
}) {
  const [f, setF] = useState<VideoForm>(initial);
  const [uploading, setUploading] = useState<"video" | "poster" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const set = (k: keyof VideoForm, v: string | boolean | number) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid var(--border, #e2e2e2)", fontSize: ".95rem",
    marginBottom: 12, boxSizing: "border-box",
  };

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "video" | "poster"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed.");
      set(kind === "video" ? "file" : "poster", d.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
      // reset the input so the same file can be re-selected
      e.target.value = "";
    }
  }

  const uploadBtn: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px dashed #f59e0b",
    background: "#fffbeb",
    color: "#92400e",
    fontSize: ".9rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* Video file: upload or paste path */}
      <label style={{ fontSize: ".85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
        Video file *
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={{ ...input, marginBottom: 0, flex: 1 }} placeholder="/videos/demo-shop.mp4 or upload →" value={f.file} onChange={(e) => set("file", e.target.value)} />
        <label style={{ ...uploadBtn, opacity: uploading === "video" ? 0.6 : 1 }}>
          {uploading === "video" ? "Uploading…" : "📤 Upload"}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            style={{ display: "none" }}
            disabled={uploading !== null}
            onChange={(e) => handleFileUpload(e, "video")}
          />
        </label>
      </div>
      {/* Poster: upload or paste path */}
      <label style={{ fontSize: ".85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
        Poster image <span style={{ fontWeight: 400, color: "#666" }}>(optional)</span>
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={{ ...input, marginBottom: 0, flex: 1 }} placeholder="/videos/demo-shop.png or upload →" value={f.poster} onChange={(e) => set("poster", e.target.value)} />
        <label style={{ ...uploadBtn, opacity: uploading === "poster" ? 0.6 : 1 }}>
          {uploading === "poster" ? "Uploading…" : "📤 Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            disabled={uploading !== null}
            onChange={(e) => handleFileUpload(e, "poster")}
          />
        </label>
      </div>
      {uploadError && (
        <p style={{ color: "#b3261e", fontSize: ".9rem", marginBottom: 12 }}>{uploadError}</p>
      )}
      {f.file && (
        <div style={{ marginBottom: 12 }}>
          <video src={f.file} style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} controls />
        </div>
      )}
      <input style={input} placeholder="Title *" value={f.title} onChange={(e) => set("title", e.target.value)} />
      <div style={{ display: "flex", gap: 12 }}>
        <input style={input} placeholder="Niche (e.g. Boutique)" value={f.niche} onChange={(e) => set("niche", e.target.value)} />
        <input style={input} placeholder="Channel (e.g. WhatsApp DM automation)" value={f.channel} onChange={(e) => set("channel", e.target.value)} />
      </div>
      <textarea style={{ ...input, minHeight: 90 }} placeholder="Description" value={f.description} onChange={(e) => set("description", e.target.value)} />
      <input style={input} placeholder="Sort order (0 = first)" type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />
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
        {saving ? "Saving…" : "Save video"}
      </button>
    </div>
  );
}
