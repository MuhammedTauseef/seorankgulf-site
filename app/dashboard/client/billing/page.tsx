import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import PriceValue from "@/components/PriceValue";

/** /dashboard/client/billing — pay the go-live balance and manage the care plan. */
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
            Your build is split into two payments, plus the optional monthly
            care plan. Pay securely through Whop.
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
              Go-live balance — <PriceValue>$124</PriceValue> one-time
            </h2>
            <p style={{ color: "#4b5563", marginBottom: 16 }}>
              Due when you approve your finished agent and it goes live on
              your website and channels.
            </p>
            <CheckoutButton linkKey="goLive" label={<>Pay $124 go-live balance</>} />
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>
              Care plan — <PriceValue>$99/month</PriceValue>
            </h2>
            <p style={{ color: "#4b5563", marginBottom: 16 }}>
              Ongoing monitoring, improvements, and priority support for your
              agent. Cancel anytime.
            </p>
            <CheckoutButton
              linkKey="carePlan"
              label={<>Subscribe — $99/month</>}
            />
          </div>

          <p className="fine" style={{ marginTop: 24 }}>
            Payments are processed by Whop. Your AI API usage and WhatsApp
            Business messaging charges (if used) are billed separately by
            those providers.
          </p>
        </div>
      </section>
    </main>
  );
}
