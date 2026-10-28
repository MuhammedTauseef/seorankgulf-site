import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { whatsappLink } from "@/lib/site-config";

type Lead = {
  id: string;
  name: string;
  email: string;
  business_type: string | null;
  message: string;
  created_at: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * All session/database reads happen here, behind the Suspense boundary
 * in the page shell below (required with Cache Components).
 *
 * RLS guarantees isolation: the leads query can only ever return rows
 * where user_id = auth.uid(), so Client A can never see Client B's
 * data — enforced by the database, not just the app.
 */
async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const typed = profile as { full_name?: string; role?: string } | null;
  if (typed?.role === "admin") redirect("/admin");
  const name = typed?.full_name?.split(" ")[0] ?? "";

  // Plan state, read with the same RLS-scoped pattern as /api/dashboard:
  // the user's own clients row, its latest subscription, and whether any
  // payment of theirs has succeeded. SEORankGulf plans are arranged
  // directly with the client (no self-serve checkout), so the stored
  // subscription/payment records are the only source of truth here.
  // Their stored plan keys are legacy values with no SEORankGulf tier
  // equivalent, so an active client is shown the generic "Active SEO
  // plan" — never an invented tier name or price.
  const { data: clientRow } = await supabase
    .from("clients")
    .select("id, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const client = clientRow as {
    id?: string;
    subscription_status?: string;
  } | null;

  let hasActivePlan = client?.subscription_status === "active";
  if (client?.id) {
    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sub = subRow as { status?: string } | null;
    if (sub?.status === "active" || sub?.status === "trialing") {
      hasActivePlan = true;
    }
    if (!hasActivePlan) {
      const { data: paidRows } = await supabase
        .from("payments")
        .select("id")
        .eq("client_id", client.id)
        .eq("status", "succeeded")
        .limit(1);
      if ((paidRows ?? []).length > 0) hasActivePlan = true;
    }
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, business_type, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (leads ?? []) as Lead[];

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>Welcome{name ? `, ${name}` : ""}</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            {rows.length} enquir{rows.length === 1 ? "y" : "ies"} submitted from
            your account.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginBottom: 34,
        }}
      >
        <div className="price-card" style={{ padding: 26 }}>
          <div className="service-num">Enquiries</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--ink)" }}>
            {rows.length}
          </div>
        </div>
        <div className="price-card" style={{ padding: 26 }}>
          <div className="service-num">Plan</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--ink)" }}>
            {hasActivePlan ? "Active SEO plan" : "No active SEO plan"}
          </div>
          {hasActivePlan ? (
            <p style={{ color: "var(--muted)", fontSize: ".9rem", margin: "8px 0 0" }}>
              Your SEO plan is active. Plan changes and billing are handled
              directly with our team — message us any time about your
              campaign.
            </p>
          ) : (
            <>
              <p style={{ color: "var(--muted)", fontSize: ".9rem", margin: "8px 0 0" }}>
                SEO plans: Starter $300/mo · Growth $600/mo · Enterprise
                $1,200/mo.
              </p>
              <div style={{ marginTop: 12 }}>
                <Link
                  href="/#pricing"
                  style={{ color: "var(--ink)", fontWeight: 700, fontSize: ".92rem", textDecoration: "underline" }}
                >
                  See plans &amp; pricing
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="price-card" style={{ padding: 26 }}>
          <div className="service-num">Next step</div>
          <Link
            href="/seo-audit"
            className="btn btn-gold"
            style={{ minHeight: 46, padding: "0 18px", fontSize: ".92rem" }}
          >
            Request your free SEO audit
          </Link>
          <div style={{ marginTop: 12 }}>
            <a
              href={whatsappLink(
                "Hi SEORankGulf, I'd like a free SEO audit for my business."
              )}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ink)", fontWeight: 700, fontSize: ".92rem", textDecoration: "underline" }}
            >
              💬 Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "1.4rem", color: "var(--ink)", marginBottom: 16 }}>
        Your enquiries
      </h2>

      {error ? (
        <div className="empty">
          Could not load your enquiries. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="empty">
          Nothing here yet. Use the <Link href="/#contact">contact form</Link>{" "}
          while signed in and your messages will appear here.
        </div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Sent</th>
              <th>Business</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: "nowrap" }}>
                  {formatDate(l.created_at)}
                </td>
                <td>{l.business_type || "—"}</td>
                <td className="msg">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

/**
 * /dashboard — client home. Any signed-in user lands here
 * (admins are routed to /admin by the login page and proxy).
 */
export default function DashboardPage() {
  return (
    <main className="admin-wrap dash-shell">
      <Suspense fallback={<div className="empty">Loading your dashboard…</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
