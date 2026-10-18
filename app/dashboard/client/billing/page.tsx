import Link from "next/link";
import { whatsappLink } from "@/lib/site-config";

/** /dashboard/client/billing — SEORankGulf billing info. */
export default function BillingPage() {
  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <Link
            href="/dashboard/client"
            style={{ color: "#6b7280", textDecoration: "none", fontSize: ".9rem" }}
          >
            ← Back to dashboard
          </Link>
          <h1 className="display" style={{ fontSize: "2rem", marginTop: 16 }}>
            Billing
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 32 }}>
            Your SEORankGulf plan is billed monthly. No long-term contracts —
            cancel anytime.
          </p>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>
              Monthly SEO plan
            </h2>
            <p style={{ color: "#4b5563", marginBottom: 16 }}>
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
      </section>
    </main>
  );
}
