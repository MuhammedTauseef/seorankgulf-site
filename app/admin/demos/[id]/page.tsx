"use client";


import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DemoFormFields, { emptyDemoForm, type DemoForm } from "@/components/DemoForm";

/** /admin/demos/[id] — edit a demo agent. */
function EditDemoForm() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<DemoForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/demos/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.demo) {
          setError("Demo not found.");
        } else {
          const v = d.demo;
          setInitial({
            tag: v.tag || "",
            name: v.name || "",
            slug: v.slug || "",
            text: v.text || "",
            group_name: v.group_name || "website",
            business: v.business || "",
            blurb: v.blurb || "",
            welcome: v.welcome || "",
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

  async function onSave(f: DemoForm) {
    if (!f.name.trim()) {
      setError("Business name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/demos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...f }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/demos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  if (loading) return <main className="admin-wrap"><p>Loading…</p></main>;

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link href="/admin/demos" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
        ← All demos
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>Edit demo agent</h1>
      {error && <p style={{ color: "#b3261e" }}>{error}</p>}
      {initial && <DemoFormFields initial={initial} onSave={onSave} saving={saving} isNew={false} />}
    </main>
  );
}

/** Wrapper with Suspense boundary for static prerendering. */
export default function EditDemoPage() {
  return (
    <Suspense fallback={<main className="admin-wrap"><p>Loading…</p></main>}>
      <EditDemoForm />
    </Suspense>
  );
}
