"use client";

import { useState } from "react";

/**
 * ImageUploadButton — small reusable "upload image" control for admin forms.
 * File picker → POST /api/admin/upload (kind=poster) → onUploaded(publicUrl).
 */
export default function ImageUploadButton({
  onUploaded,
  label = "📤 Upload image",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "poster"); // image upload path
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed.");
      onUploaded(d.url as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
      <label
        style={{
          background: "#f59e0b",
          color: "#111827",
          padding: "8px 16px",
          borderRadius: 8,
          fontWeight: 600,
          cursor: uploading ? "wait" : "pointer",
          fontSize: ".85rem",
          opacity: uploading ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {uploading ? "Uploading…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: "none" }}
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {error && <span style={{ color: "#b3261e", fontSize: ".8rem" }}>{error}</span>}
    </div>
  );
}
