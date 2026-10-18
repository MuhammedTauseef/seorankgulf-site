"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DemoFormFields, { emptyDemoForm, type DemoForm } from "@/components/DemoForm";

/** /admin/demos/new — add a demo agent. */
export default function NewDemoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave(f: DemoForm) {
    if (!f.name.trim() || !f.slug.trim()) {
      setError("Business name and slug are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      router.push("/admin/demos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <main className="admin-wrap" style={{ maxWidth: 800 }}>
      <Link href="/admin/demos" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
        ← All demos
      </Link>
      <h1 style={{ margin: "12px 0 20px" }}>New demo agent</h1>
      {error && <p style={{ color: "#b3261e" }}>{error}</p>}
      <DemoFormFields initial={emptyDemoForm} onSave={onSave} saving={saving} isNew />
    </main>
  );
}
