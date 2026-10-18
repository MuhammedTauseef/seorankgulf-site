"use client";


import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import VideoFormFields, { emptyVideoForm, type VideoForm } from "@/components/VideoForm";

/** /admin/videos/[id] — edit a video. */
function EditVideoForm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<VideoForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/videos/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.video) {
          setError("Video not found.");
        } else {
          const v = d.video;
          setInitial({
            file: v.file || "",
            poster: v.poster || "",
            niche: v.niche || "",
            channel: v.channel || "",
            title: v.title || "",
            description: v.description || "",
            published: v.published !== false,
            sort_order: v.sort_order || 0,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load.");
        setLoading(false);
      });
  }, [id]);

  async function onSave(f: VideoForm) {
    if (!f.file.trim() || !f.title.trim()) {
      setError("Video file and title are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...f }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/videos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link href="/admin/videos" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
        ← All videos
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>Edit video</h1>
      {error && <p style={{ color: "#b3261e" }}>{error}</p>}
      {initial && <VideoFormFields initial={initial} onSave={onSave} saving={saving} />}
    </main>
  );
}

/** Wrapper with Suspense boundary for static prerendering. */
export default function EditVideoPage() {
  return (
    <Suspense fallback={<main className="admin-wrap"><p>Loading…</p></main>}>
      <EditVideoForm />
    </Suspense>
  );
}
