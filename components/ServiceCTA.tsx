import Link from "next/link";

const WHATSAPP =
  "https://wa.me/923150642491?text=Hi!%20I%20want%20a%20free%20SEO%20audit%20for%20my%20business.";

/** Shared WhatsApp + contact CTA block for service pages. */
export default function ServiceCTA({ heading }: { heading?: string }) {
  return (
    <div
      style={{
        marginTop: 48,
        padding: "32px 28px",
        background: "var(--card)",
        borderRadius: 16,
        border: "1px solid rgba(216,189,143,.25)",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>
        {heading || "Get your free SEO audit"}
      </h2>
      <p style={{ margin: "0 0 20px", color: "var(--muted, #94a3b8)" }}>
        See exactly what is holding your website back — honest recommendations,
        no obligation, no sales pressure.
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener"
          className="btn btn-gold"
        >
          WhatsApp us: +92 315 0642491
        </a>
        <Link href="/contact" className="btn btn-ghost">
          Contact us
        </Link>
      </div>
    </div>
  );
}
