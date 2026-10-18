"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoFormFields, { emptyVideoForm, type VideoForm } from "@/components/VideoForm";

/** /admin/videos/new — add a video. */
export default function NewVideoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave(f: VideoForm) {
    if (!f.file.trim() || !f.title.trim()) {
      setError("Video file and title are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/videos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link href="/admin/videos" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
        ← All videos
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>New video</h1>
      {error && <p style={{ color: "#b3261e" }}>{error}</p>}
      <VideoFormFields initial={emptyVideoForm} onSave={onSave} saving={saving} />
    </main>
  );
}
