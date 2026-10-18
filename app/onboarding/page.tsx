"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceItem {
  name: string;
  price: string;
}
interface FaqItem {
  q: string;
  a: string;
}

const STEPS = ["Business Info", "Services & Prices", "FAQs", "WhatsApp & Review"];

/** /onboarding — 4-step client onboarding for Phase 2 self-service agent builder. */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([{ name: "", price: "" }]);
  const [faqs, setFaqs] = useState<FaqItem[]>([{ q: "", a: "" }]);
  const [whatsapp, setWhatsapp] = useState("");

  const validStep = () => {
    if (step === 0) return businessName.trim().length > 1 && industry.trim().length > 1;
    if (step === 1) return services.some((s) => s.name.trim());
    if (step === 2) return faqs.some((f) => f.q.trim() && f.a.trim());
    if (step === 3) return whatsapp.trim().length >= 7;
    return false;
  };

  const addService = () => setServices([...services, { name: "", price: "" }]);
  const addFaq = () => setFaqs([...faqs, { q: "", a: "" }]);

  const finish = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          industry: industry.trim(),
          website: website.trim(),
          business_description: description.trim(),
          services: services.filter((s) => s.name.trim()),
          faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
          whatsapp_number: whatsapp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save. Try again.");
      router.push("/onboarding/preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    marginBottom: 12,
  };

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 680 }}>
          <span className="eyebrow">Get Started</span>
          <h1 className="display" style={{ fontSize: "2.2rem", marginBottom: 8 }}>
            Build your AI agent
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 28 }}>
            Tell us about your business — your AI agent is generated automatically.
            Takes about 10 minutes.
          </p>

          {/* Stepper */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: i === step ? "#b45309" : i < step ? "#16a34a" : "#9ca3af",
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: i <= step ? "#f59e0b" : "#e5e7eb",
                    marginBottom: 6,
                  }}
                />
                {s}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 16 }}>About your business</h2>
              <input style={inputStyle} placeholder="Business name *" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              <input style={inputStyle} placeholder="Industry (e.g. dental clinic, restaurant) *" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              <input style={inputStyle} placeholder="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <textarea style={{ ...inputStyle, minHeight: 100 }} placeholder="Describe your business in 2-3 sentences — what you do, who you serve..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 8 }}>Services & prices</h2>
              <p style={{ color: "#6b7280", marginBottom: 16 }}>Your agent will quote these automatically.</p>
              {services.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input style={inputStyle} placeholder="Service name *" value={s.name} onChange={(e) => { const n = [...services]; n[i].name = e.target.value; setServices(n); }} />
                  <input style={{ ...inputStyle, maxWidth: 140 }} placeholder="Price" value={s.price} onChange={(e) => { const n = [...services]; n[i].price = e.target.value; setServices(n); }} />
                </div>
              ))}
              <button onClick={addService} style={{ background: "none", border: "1px dashed #9ca3af", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 8 }}>+ Add service</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 8 }}>Common questions</h2>
              <p style={{ color: "#6b7280", marginBottom: 16 }}>Questions customers ask you again and again.</p>
              {faqs.map((f, i) => (
                <div key={i} style={{ marginBottom: 16, padding: 16, background: "#f9fafb", borderRadius: 10 }}>
                  <input style={inputStyle} placeholder="Question *" value={f.q} onChange={(e) => { const n = [...faqs]; n[i].q = e.target.value; setFaqs(n); }} />
                  <textarea style={{ ...inputStyle, minHeight: 70, marginBottom: 0 }} placeholder="Your answer *" value={f.a} onChange={(e) => { const n = [...faqs]; n[i].a = e.target.value; setFaqs(n); }} />
                </div>
              ))}
              <button onClick={addFaq} style={{ background: "none", border: "1px dashed #9ca3af", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>+ Add question</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 8 }}>WhatsApp & review</h2>
              <p style={{ color: "#6b7280", marginBottom: 16 }}>Where should the agent chat with your customers?</p>
              <input style={inputStyle} placeholder="WhatsApp number (e.g. +1 555 123 4567) *" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: 16, marginTop: 8 }}>
                <strong>Summary</strong>
                <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
                  {businessName} ({industry})<br />
                  {services.filter((s) => s.name.trim()).length} services · {faqs.filter((f) => f.q.trim()).length} FAQs
                </p>
              </div>
            </div>
          )}

          {error && <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontWeight: 600 }}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => validStep() && setStep(step + 1)} disabled={!validStep()} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: validStep() ? "#f59e0b" : "#e5e7eb", color: validStep() ? "#111827" : "#9ca3af", cursor: validStep() ? "pointer" : "not-allowed", fontWeight: 700 }}>
                Continue →
              </button>
            ) : (
              <button onClick={finish} disabled={!validStep() || saving} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "#f59e0b", color: "#111827", cursor: "pointer", fontWeight: 700 }}>
                {saving ? "Generating your agent..." : "Generate my AI agent →"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
