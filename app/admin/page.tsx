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

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  slot_start: string;
  slot_end: string;
  status: string;
  source: string | null;
  created_at: string;
};

type Client = {
  id: string;
  business_name: string;
  industry: string;
  website: string | null;
  business_description: string | null;
  services: { name: string }[] | null;
  faqs: { q: string; a: string }[] | null;
  whatsapp_number: string;
  agent_status: string;
  created_at: string;
};

type ChatMessage = { role: string; text: string };

type Transcript = {
  id: string;
  user_id: string | null;
  persona_name: string | null;
  messages: ChatMessage[];
  created_at: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

function transcriptName(t: Transcript): string {
  const p = t.profiles;
  if (!p) return "—";
  if (Array.isArray(p)) return p[0]?.full_name || "—";
  return p.full_name || "—";
}

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

/** PKT slot label, e.g. "Thu 9 Oct, 14:30". */
function formatSlot(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
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

function TranscriptsTable({ rows }: { rows: Transcript[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No chats yet. When visitors use the AI demo, their conversations will
        appear here.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Visitor</th>
          <th>Demo</th>
          <th>Conversation</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.created_at)}</td>
            <td>{transcriptName(t)}</td>
            <td>{t.persona_name || "SEORankGulf"}</td>
            <td className="msg">
              <details>
                <summary style={{ cursor: "pointer", color: "var(--accent, #f59e0b)" }}>
                  {t.messages.length} messages — view
                </summary>
                <div style={{ marginTop: 8, maxHeight: 300, overflowY: "auto" }}>
                  {t.messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: ".8rem", color: m.role === "user" ? "#60a5fa" : "#34d399" }}>
                        {m.role === "user" ? "Visitor" : "AI"}:
                      </strong>{" "}
                      <span style={{ fontSize: ".85rem" }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </details>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BookingsTable({ rows }: { rows: Booking[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No bookings yet. When visitors book a demo through the chat, they will
        appear here.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Slot (PKT)</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <td style={{ whiteSpace: "nowrap" }}>
              <strong>{formatSlot(b.slot_start)}</strong>
            </td>
            <td>
              <strong>{b.name}</strong>
            </td>
            <td>
              <a href={`mailto:${b.email}`}>{b.email}</a>
            </td>
            <td>{b.phone || "—"}</td>
            <td>{b.status}</td>
            <td>
              <DeleteButton type="booking" id={b.id} label={b.name} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClientsTable({ rows }: { rows: Client[] }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        No clients yet. When a client completes onboarding, their business
        details will appear here.
      </div>
    );
  }
  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Business</th>
          <th>Industry</th>
          <th>WhatsApp</th>
          <th>Services</th>
          <th>FAQs</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.id}>
            <td>
              <strong>{c.business_name}</strong>
              {c.website && (
                <>
                  <br />
                  <a href={c.website} target="_blank" rel="noreferrer" style={{ fontSize: ".85rem" }}>
                    {c.website}
                  </a>
                </>
              )}
              {c.business_description && (
                <div className="msg" style={{ marginTop: 4 }}>{c.business_description}</div>
              )}
            </td>
            <td>{c.industry}</td>
            <td style={{ whiteSpace: "nowrap" }}>{c.whatsapp_number}</td>
            <td className="msg">
              {(c.services ?? []).map((s) => s.name).filter(Boolean).join(", ") || "—"}
            </td>
            <td className="msg">
              {(c.faqs ?? []).map((f) => `Q: ${f.q}`).filter((q) => q !== "Q: ").join(" | ") || "—"}
            </td>
            <td>{c.agent_status}</td>
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

  const [{ data: leads, error: leadsError }, { data: bookings, error: bookingsError }, { data: clients, error: clientsError }, { data: transcripts }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id, name, email, business_type, message, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("bookings")
        .select("id, name, email, phone, slot_start, slot_end, status, source, created_at")
        .order("slot_start", { ascending: true })
        .limit(200),
      supabase
        .from("clients")
        .select("id, business_name, industry, website, business_description, services, faqs, whatsapp_number, agent_status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("chat_transcripts")
        .select("id, user_id, persona_name, messages, created_at, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (leadsError || bookingsError || clientsError) {
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

      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Clients
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}>
          Onboarding details submitted by clients — business info, services,
          FAQs, and WhatsApp number for building their agent.
        </p>
        <ClientsTable rows={(clients ?? []) as Client[]} />
      </section>

      <section>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Demo bookings
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}>
          Upcoming demo calls booked through the chat, soonest first.
        </p>
        <BookingsTable rows={(bookings ?? []) as Booking[]} />
      </section>

      <section style={{ marginTop: 48 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            letterSpacing: "-.01em",
            marginBottom: 6,
          }}
        >
          Chat transcripts
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".92rem", margin: "0 0 18px" }}>
          AI demo conversations, newest first. Click “view” to read the full chat.
        </p>
        <TranscriptsTable rows={(transcripts ?? []) as Transcript[]} />
      </section>
    </>
  );
}

/**
 * /admin — leads + bookings dashboard. The proxy already redirects signed-out
 * visitors to /admin/login; this page double-checks the session itself.
 */
export default function AdminPage() {
  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Enquiries and demo bookings, at a glance.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/admin/blog" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Blog posts →
          </a>
          <a href="/admin/content" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem", fontWeight: 700 }}>
            Site Content →
          </a>
          <a href="/admin/videos" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Videos →
          </a>
          <a href="/admin/demos" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Demos →
          </a>
          <a href="/admin/settings" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Settings →
          </a>
          <a href="/admin/pages" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Pages →
          </a>
          <a href="/admin/payments" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            Payments →
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
