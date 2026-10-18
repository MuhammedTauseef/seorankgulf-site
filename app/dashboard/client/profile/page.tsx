"use client";

import { useEffect, useState } from "react";

/** /dashboard/client/profile — edit own profile (name only). */
export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setEmail(d.profile.email || "");
        setRole(d.profile.role || "");
        setName(d.profile.full_name || "");
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  async function save() {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setName(data.full_name);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading profile…</p>;

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 480 }}>
      <h2 style={{ margin: "0 0 6px" }}>Profile settings</h2>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {saved && <p style={{ color: "#22c55e" }}>✓ Saved successfully.</p>}

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: ".9rem", fontWeight: 600 }}>Full name</label>
        <input
          className="admin-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="Your name"
          maxLength={120}
        />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: ".9rem", fontWeight: 600 }}>Email</label>
        <input className="admin-input" value={email} disabled style={{ opacity: 0.6 }} />
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
          Email cannot be changed here. Contact support if needed.
        </span>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: ".9rem", fontWeight: 600 }}>Account type</label>
        <span className="badge badge-gold" style={{ width: "fit-content" }}>{role}</span>
      </div>

      <div>
        <button className="btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
