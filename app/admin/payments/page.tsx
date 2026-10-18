import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

type Payment = {
  id: string;
  buyer_email: string | null;
  buyer_name: string | null;
  amount_cents: number;
  currency: string;
  type: string;
  plan_key: string | null;
  status: string;
  paid_at: string | null;
  verified_at: string | null;
  client_id: string | null;
  created_at: string;
};

type WebhookEvent = {
  id: string;
  webhook_id: string;
  event_type: string;
  signature_valid: boolean;
  processed: boolean;
  error: string | null;
  received_at: string;
};

function formatMoney(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return `$${amount} ${currency.toUpperCase()}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const TYPE_LABELS: Record<string, string> = {
  upfront: "Deposit ($125)",
  go_live: "Go-Live ($124)",
  monthly: "Care Plan ($99/mo)",
  refund: "Refund",
};

async function PaymentsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: payments }, { data: events }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, buyer_email, buyer_name, amount_cents, currency, type, plan_key, status, paid_at, verified_at, client_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("webhook_events")
      .select("id, webhook_id, event_type, signature_valid, processed, error, received_at")
      .eq("provider", "whop")
      .order("received_at", { ascending: false })
      .limit(50),
  ]);

  const paymentList = (payments || []) as Payment[];
  const eventList = (events || []) as WebhookEvent[];

  const succeeded = paymentList.filter((p) => p.status === "succeeded");
  const failed = paymentList.filter((p) => p.status === "failed");
  const unmatched = paymentList.filter((p) => !p.client_id && p.status === "succeeded");
  const totalRevenue = succeeded.reduce((sum, p) => sum + p.amount_cents, 0);
  const invalidEvents = eventList.filter((e) => !e.signature_valid);
  const erroredEvents = eventList.filter((e) => e.signature_valid && !e.processed && e.error);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Payments</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>
            Whop webhook-verified payment ledger. Every payment is signature-checked before recording.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/admin" style={{ fontSize: ".9em" }}>← Dashboard</a>
          <LogoutButton />
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: ".8em", color: "#666" }}>Verified revenue</div>
          <div style={{ fontSize: "1.6em", fontWeight: 700, color: "#15803d" }}>
            {formatMoney(totalRevenue, "usd")}
          </div>
        </div>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: ".8em", color: "#666" }}>Succeeded</div>
          <div style={{ fontSize: "1.6em", fontWeight: 700 }}>{succeeded.length}</div>
        </div>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: ".8em", color: "#666" }}>Failed</div>
          <div style={{ fontSize: "1.6em", fontWeight: 700, color: failed.length ? "#dc2626" : "inherit" }}>
            {failed.length}
          </div>
        </div>
        <div
          style={{
            border: `1px solid ${unmatched.length ? "#f59e0b" : "#e5e5e5"}`,
            borderRadius: 8,
            padding: 16,
            background: unmatched.length ? "#fffbeb" : "transparent",
          }}
        >
          <div style={{ fontSize: ".8em", color: "#666" }}>Needs manual review</div>
          <div style={{ fontSize: "1.6em", fontWeight: 700, color: unmatched.length ? "#b45309" : "inherit" }}>
            {unmatched.length}
          </div>
          {unmatched.length > 0 && (
            <div style={{ fontSize: ".75em", color: "#92400e", marginTop: 4 }}>
              Email didn't match a client — link manually
            </div>
          )}
        </div>
      </div>

      {(invalidEvents.length > 0 || erroredEvents.length > 0) && (
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fef2f2",
            borderRadius: 8,
            padding: 16,
            marginBottom: 28,
          }}
        >
          <strong style={{ color: "#dc2626" }}>⚠ Security / processing alerts</strong>
          {invalidEvents.length > 0 && (
            <div style={{ marginTop: 8, fontSize: ".9em" }}>
              {invalidEvents.length} webhook delivery(s) rejected — invalid signature (blocked).
            </div>
          )}
          {erroredEvents.length > 0 && (
            <div style={{ marginTop: 8, fontSize: ".9em" }}>
              {erroredEvents.length} webhook event(s) failed processing — Whop will retry.
            </div>
          )}
        </div>
      )}

      {/* Payments table */}
      <h2 style={{ marginBottom: 12 }}>Payment ledger</h2>
      {paymentList.length === 0 ? (
        <p style={{ color: "#666" }}>
          No payments recorded yet. When a client pays via Whop, the webhook will record it here automatically.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: 32 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9em" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e5e5" }}>
                <th style={{ padding: "8px" }}>Buyer</th>
                <th style={{ padding: "8px" }}>Type</th>
                <th style={{ padding: "8px" }}>Amount</th>
                <th style={{ padding: "8px" }}>Status</th>
                <th style={{ padding: "8px" }}>Paid at</th>
                <th style={{ padding: "8px" }}>Client linked</th>
              </tr>
            </thead>
            <tbody>
              {paymentList.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px" }}>
                    <div>{p.buyer_name || "—"}</div>
                    <div style={{ fontSize: ".85em", color: "#666" }}>{p.buyer_email || "—"}</div>
                  </td>
                  <td style={{ padding: "8px" }}>{TYPE_LABELS[p.type] || p.type}</td>
                  <td style={{ padding: "8px", fontWeight: 600 }}>
                    {formatMoney(p.amount_cents, p.currency)}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 999,
                        fontSize: ".8em",
                        fontWeight: 600,
                        background:
                          p.status === "succeeded"
                            ? "#dcfce7"
                            : p.status === "failed"
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          p.status === "succeeded"
                            ? "#15803d"
                            : p.status === "failed"
                            ? "#dc2626"
                            : "#92400e",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px", whiteSpace: "nowrap" }}>{formatDate(p.paid_at)}</td>
                  <td style={{ padding: "8px" }}>
                    {p.client_id ? (
                      <span style={{ color: "#15803d" }}>✓ linked</span>
                    ) : (
                      <span style={{ color: "#b45309" }}>⚠ manual review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Webhook audit log */}
      <h2 style={{ marginBottom: 12 }}>Webhook audit log</h2>
      <p style={{ color: "#666", fontSize: ".9em", marginBottom: 12 }}>
        Every delivery from Whop is logged here with its signature check result.
      </p>
      {eventList.length === 0 ? (
        <p style={{ color: "#666" }}>No webhook deliveries yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85em" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e5e5" }}>
                <th style={{ padding: "8px" }}>Event</th>
                <th style={{ padding: "8px" }}>Signature</th>
                <th style={{ padding: "8px" }}>Processed</th>
                <th style={{ padding: "8px" }}>Received</th>
                <th style={{ padding: "8px" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {eventList.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px", fontFamily: "monospace" }}>{e.event_type}</td>
                  <td style={{ padding: "8px" }}>
                    {e.signature_valid ? (
                      <span style={{ color: "#15803d" }}>✓ valid</span>
                    ) : (
                      <span style={{ color: "#dc2626" }}>✗ invalid — blocked</span>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>{e.processed ? "✓" : "—"}</td>
                  <td style={{ padding: "8px", whiteSpace: "nowrap" }}>{formatDate(e.received_at)}</td>
                  <td style={{ padding: "8px", color: "#dc2626" }}>{e.error || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading payments…</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
