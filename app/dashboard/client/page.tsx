"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  business_name: string;
  industry: string;
  agent_status: string;
  subscription_status: string;
  stats: { chats: number; leads: number; bookings: number };
  payments: { amount_cents: number; type: string; status: string; paid_at: string }[];
}

/** /dashboard/client — Phase 2 client dashboard: agent stats, billing, settings. */
export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main><section className="block"><div className="wrap"><p>Loading your dashboard...</p></div></section></main>
    );
  }

  if (!data) {
    return (
      <main>
        <section className="block">
          <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
            <h1 className="display" style={{ fontSize: "2rem" }}>No agent yet</h1>
            <p style={{ color: "#4b5563", marginBottom: 24 }}>
              Build your AI agent first — it only takes 10 minutes.
            </p>
            <Link href="/onboarding" className="btn btn-gold" style={{ padding: "12px 32px", borderRadius: 10, background: "#f59e0b", textDecoration: "none", color: "#111827", fontWeight: 700 }}>
              Build my agent →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const statusColor =
    data.agent_status === "live" ? "#16a34a" :
    data.agent_status === "ready" ? "#2563eb" : "#b45309";

  const statCards = [
    { label: "Chats handled", value: data.stats.chats },
    { label: "Leads captured", value: data.stats.leads },
    { label: "Bookings", value: data.stats.bookings },
  ];

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: ".9rem" }}>
            ← Home
          </Link>
          <span className="eyebrow" style={{ display: "block", marginTop: 12 }}>My Agent Dashboard</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
            <h1 className="display" style={{ fontSize: "2.2rem", margin: 0 }}>{data.business_name}</h1><span style={{
              background: statusColor + "1a", color: statusColor,
              padding: "6px 16px", borderRadius: 20, fontWeight: 700, fontSize: ".85rem",
              textTransform: "uppercase",
            }}>
              {data.agent_status}
            </span>
          </div>
          <p style={{ color: "#4b5563", marginBottom: 32 }}>{data.industry} · Subscription: {data.subscription_status}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
            {statCards.map((s) => (
              <div key={s.label} style={{ background: "#f9fafb", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1e3a5f" }}>{s.value}</div>
                <div style={{ color: "#6b7280", fontSize: ".9rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Quick actions</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <Link href="/onboarding/preview" style={{ padding: "12px 24px", borderRadius: 10, background: "#1e3a5f", color: "white", textDecoration: "none", fontWeight: 600 }}>
              💬 Test my agent
            </Link>
            <Link href="/dashboard/client/documents" style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #d1d5db", textDecoration: "none", color: "#374151", fontWeight: 600 }}>
              📄 Knowledge base
            </Link>
            <Link href="/dashboard/client/billing" style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #d1d5db", textDecoration: "none", color: "#374151", fontWeight: 600 }}>
              💳 Billing
            </Link>
          </div>

          <h2 style={{ fontSize: "1.4rem", marginBottom: 16 }}>Recent payments</h2>
          {data.payments.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>No payments yet.</p>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              {data.payments.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < data.payments.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ textTransform: "capitalize" }}>{p.type.replace("_", " ")}</span>
                  <span style={{ fontWeight: 700 }}>${(p.amount_cents / 100).toFixed(2)}</span>
                  <span style={{ color: p.status === "succeeded" ? "#16a34a" : "#b45309", fontSize: ".85rem" }}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
