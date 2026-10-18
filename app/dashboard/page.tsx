import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

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
          <p style={{ color: "#4b5563", margin: "6px 0 0" }}>
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
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1b2653" }}>
            {rows.length}
          </div>
        </div>
        <div className="price-card" style={{ padding: 26 }}>
          <div className="service-num">Plan</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1b2653" }}>
            Free demo
          </div>
          <p style={{ color: "#4b5563", fontSize: ".9rem", margin: "8px 0 0" }}>
            Your AI agent setup is <strong>$249</strong> one-time.
          </p>
        </div>
        <div className="price-card" style={{ padding: 26 }}>
          <div className="service-num">Next step</div>
          <Link
            href="/#contact"
            className="btn btn-gold"
            style={{ minHeight: 46, padding: "0 18px", fontSize: ".92rem" }}
          >
            Request your AI agent
          </Link>
          <div style={{ marginTop: 12 }}>
            <Link
              href="/dashboard/client/billing"
              style={{ color: "#1b2653", fontWeight: 700, fontSize: ".92rem", textDecoration: "underline" }}
            >
              💳 Billing — pay $124 / $99 plan
            </Link>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "1.4rem", color: "#1b2653", marginBottom: 16 }}>
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
    <main className="admin-wrap">
      <Suspense fallback={<div className="empty">Loading your dashboard…</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
