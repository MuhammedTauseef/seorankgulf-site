import { whatsappLink } from "@/lib/site-config";

/** /dashboard/client/billing — SEORankGulf billing info. */
export default function BillingPage() {
  return (
    <main className="admin-wrap dash-shell">
      <div style={{ maxWidth: 720 }}>
        <h1
          className="display"
          style={{ fontSize: "2rem", letterSpacing: "-.02em", margin: "0 0 12px" }}
        >
          Billing
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>
          Your SEORankGulf plan is billed monthly. No long-term contracts —
          cancel anytime.
        </p>

        <div className="price-card dash-card" style={{ padding: 26, marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>
            Monthly SEO plan
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>
            Invoices are sent monthly. To upgrade, downgrade, or discuss
            your plan, message us on WhatsApp.
          </p>
          <a
            className="btn btn-gold"
            href={whatsappLink("Hi! I want to discuss my SEORankGulf billing.")}
            target="_blank"
            rel="noopener"
          >
            Chat on WhatsApp <span aria-hidden="true">→</span>
          </a>
        </div>

        <p className="fine" style={{ marginTop: 24 }}>
          Plans: Starter $300/mo · Growth $600/mo · Enterprise $1,200/mo.
        </p>
      </div>
    </main>
  );
}
