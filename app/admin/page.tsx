import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import DeleteButton from "@/components/DeleteButton";

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

function LeadsTable({ rows }: { rows: Lead[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No enquiries yet. When visitors use the contact form, they will appear
        here.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Received</th>
          <th>Name</th>
          <th>Email</th>
          <th>Business</th>
          <th>Message</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <tr key={l.id}>
            <td style={{ whiteSpace: "nowrap" }}>{formatDate(l.created_at)}</td>
            <td>
              <strong>{l.name}</strong>
            </td>
            <td>
              <a href={`mailto:${l.email}`}>{l.email}</a>
            </td>
            <td>{l.business_type || "—"}</td>
            <td className="msg">{l.message}</td>
            <td>
              <DeleteButton type="lead" id={l.id} label={l.name} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Session-gated content. Reading the session is a request-time operation,
 * so with Cache Components it streams in behind the Suspense boundary
 * below instead of blocking the static shell.
 */
async function AdminContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, name, email, business_type, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (leadsError) {
    return (
      <div className="empty">
        Could not load dashboard data. Check the database setup (see
        supabase/schema.sql).
      </div>
    );
  }

  return (
    <>
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Enquiries
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}>
          Messages from the website contact form, newest first.
        </p>
        <LeadsTable rows={(leads ?? []) as Lead[]} />
      </section>
    </>
  );
}

/**
 * /admin — enquiries dashboard. The proxy already redirects signed-out
 * visitors to /admin/login; this page double-checks the session itself.
 */
export default function AdminPage() {
  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Enquiries from the contact form, at a glance.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/admin/blog" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Blog posts →
          </a>
          <a href="/admin/content" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem", fontWeight: 700 }}>
            Site Content →
          </a>
          <a href="/admin/settings" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Settings →
          </a>
          <a href="/admin/pages" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Pages →
          </a>
          <a href="/" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Home
          </a>
          <LogoutButton />
        </div>
      </div>

      <Suspense fallback={<div className="empty">Loading dashboard…</div>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
