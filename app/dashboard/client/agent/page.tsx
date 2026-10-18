"use client";

import { useEffect, useState } from "react";

type AgentConfig = {
  agent_name?: string;
  greeting?: string;
  tone?: string;
  language?: string;
  business_hours?: string;
  auto_reply?: string;
};

const TONES = ["friendly", "professional", "playful", "formal"];

/** /dashboard/client/agent — agent configuration (owner only). */
export default function AgentConfigPage() {
  const [config, setConfig] = useState<AgentConfig>({});
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/agent-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setConfig(d.agent_config || {});
        setStatus(d.agent_status || "draft");
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  function set(key: keyof AgentConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/agent-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading agent settings…</p>;
  if (error && loading === false && Object.keys(config).length === 0 && !error.includes("save"))
    return <p style={{ color: "#ef4444" }}>{error}</p>;

  const field = (label: string, key: keyof AgentConfig, placeholder: string, multiline = false) => (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: ".9rem", fontWeight: 600 }}>{label}</label>
      {multiline ? (
        <textarea
          className="admin-input"
          value={config[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={1000}
        />
      ) : (
        <input
          className="admin-input"
          value={config[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          maxLength={200}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <div>
        <h2 style={{ margin: "0 0 6px" }}>Agent configuration</h2>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>
          Customize how your AI agent talks to your customers. Status:{" "}
          <span className="badge badge-gold">{status}</span>
        </p>
      </div>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {saved && <p style={{ color: "#22c55e" }}>✓ Saved successfully.</p>}

      {field("Agent name", "agent_name", "e.g. Sara — your virtual assistant")}
      {field("Greeting message", "greeting", "e.g. Hi! Welcome to our salon. How can I help?", true)}

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: ".9rem", fontWeight: 600 }}>Tone</label>
        <select
          className="admin-input"
          value={config.tone || "friendly"}
          onChange={(e) => set("tone", e.target.value)}
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {field("Language", "language", "e.g. English, Urdu, Roman Urdu")}
      {field("Business hours", "business_hours", "e.g. Mon–Sat, 10am–8pm PKT", true)}
      {field("Auto-reply note", "auto_reply", "e.g. We reply within 2 hours during business hours.", true)}

      <div>
        <button className="btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save configuration"}
        </button>
      </div>
    </div>
  );
}
