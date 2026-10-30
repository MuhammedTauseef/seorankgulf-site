import { whatsappLink } from "@/lib/site-config";

const WHOP_CHECKOUT_URLS: Record<string, string> = {
  Starter: "https://whop.com/seorankgulf/starter-seo-ab",
  Growth: "https://whop.com/seorankgulf/growth-seo",
  Enterprise: "https://whop.com/seorankgulf/enterprise-seo",
};

const PLANS = [
  { name: "Starter", price: "$300/mo" },
  { name: "Growth", price: "$600/mo" },
  { name: "Enterprise", price: "$1,200/mo" },
] as const;

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

        <h2 style={{ fontSize: "1.2rem", margin: "28px 0 8px" }}>
          Pay by card
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Prefer to pay by card? Pick your plan below — secure checkout by
          Whop (USD), billed monthly.
        </p>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="price-card dash-card"
            style={{ padding: 26, marginBottom: 16 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{plan.name}</h3>
              <span style={{ fontWeight: 700 }}>{plan.price}</span>
            </div>
            <a
              className="btn btn-gold"
              style={{
                width: "100%",
                textAlign: "center",
                display: "block",
              }}
              href={WHOP_CHECKOUT_URLS[plan.name]}
              target="_blank"
              rel="noopener"
            >
              Pay by card — Whop (USD)
            </a>
          </div>
        ))}

        <p className="fine" style={{ marginTop: 24 }}>
          Plans: Starter $300/mo · Growth $600/mo · Enterprise $1,200/mo.
        </p>
      </div>
    </main>
  );
}
