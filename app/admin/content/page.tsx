"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";

/** /admin/content — WordPress-style site content editor. Edit every word on the homepage. */

function Field({
  label,
  value,
  onChange,
  textarea,
  rows,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontWeight: 600, fontSize: ".85rem", marginBottom: 6 }}>
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows || 3}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
      {hint && (
        <span style={{ display: "block", fontSize: ".78rem", color: "#6b7280", marginTop: 4 }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: ".92rem",
  fontFamily: "inherit",
  background: "#fff",
  color: "#111",
};

function Section({
  title,
  desc,
  open,
  onToggle,
  children,
}: {
  title: string;
  desc: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 12, background: "#fff", overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: open ? "#f9fafb" : "#fff",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>
          <span style={{ display: "block", fontWeight: 700, fontSize: "1rem" }}>{title}</span>
          <span style={{ display: "block", fontSize: ".82rem", color: "#6b7280", marginTop: 2 }}>{desc}</span>
        </span>
        <span style={{ fontSize: "1.2rem", color: "#6b7280" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "4px 20px 20px" }}>{children}</div>}
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  renderItem,
  addLabel,
  blank,
  minItems,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, onItem: (item: T) => void, index: number) => React.ReactNode;
  addLabel: string;
  blank: T;
  minItems?: number;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 14,
            marginBottom: 10,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong style={{ fontSize: ".85rem" }}>#{i + 1}</strong>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={tinyBtn} title="Move up">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={tinyBtn} title="Move down">↓</button>
              {(!minItems || items.length > minItems) && (
                <button
                  onClick={() => onChange(items.filter((_, k) => k !== i))}
                  style={{ ...tinyBtn, color: "#dc2626" }}
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {renderItem(item, (ni) => onChange(items.map((x, k) => (k === i ? ni : x))), i)}
        </div>
      ))}
      <button onClick={() => onChange([...items, blank])} style={addBtn}>
        + {addLabel}
      </button>
    </div>
  );
}

const tinyBtn: React.CSSProperties = {
  border: "1px solid #d1d5db",
  background: "#fff",
  borderRadius: 6,
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: ".8rem",
};

const addBtn: React.CSSProperties = {
  border: "1px dashed #9ca3af",
  background: "#fff",
  borderRadius: 8,
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: ".88rem",
  color: "#374151",
  width: "100%",
};

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [waNumber, setWaNumber] = useState("");
  const [waDisplay, setWaDisplay] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [openSection, setOpenSection] = useState<string>("hero");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setMsg("Error: " + d.error);
        } else {
          setContent(d.content);
          setWaNumber(d.whatsapp_number || "");
          setWaDisplay(d.whatsapp_display || "");
        }
        setLoading(false);
      })
      .catch(() => {
        setMsg("Could not load content.");
        setLoading(false);
      });
  }, []);

  const set = <K extends keyof SiteContent>(key: K, val: SiteContent[K]) =>
    setContent((c) => (c ? { ...c, [key]: val } : c));

  async function onSave() {
    if (!content) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, whatsapp_number: waNumber, whatsapp_display: waDisplay }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed.");
      setMsg("✓ Saved! The live site will update in 2–3 minutes.");
    } catch (e) {
      setMsg("✕ " + (e instanceof Error ? e.message : "Save failed."));
    }
    setSaving(false);
  }

  if (loading)
    return (
      <main className="admin-wrap">
        <p>Loading content…</p>
      </main>
    );

  if (!content)
    return (
      <main className="admin-wrap">
        <h1>Site Content</h1>
        <p style={{ color: "#dc2626" }}>{msg || "Could not load."}</p>
        <Link href="/admin">← Dashboard</Link>
      </main>
    );

  const c = content;
  const toggle = (s: string) => setOpenSection((o) => (o === s ? "" : s));

  return (
    <main className="admin-wrap" style={{ maxWidth: 860 }}>
      <div className="admin-top">
        <div>
          <h1>Site Content</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Edit every word on the homepage — like WordPress. Save, and the live
            site updates automatically.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            ← Dashboard
          </Link>
          <a href="/" target="_blank" rel="noopener" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
            View site ↗
          </a>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              background: "#E63946",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 10,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: ".95rem",
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {msg && (
        <p
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            background: msg.startsWith("✓") ? "#ecfdf5" : "#fef2f2",
            color: msg.startsWith("✓") ? "#047857" : "#dc2626",
            fontWeight: 600,
          }}
        >
          {msg}
        </p>
      )}

      {/* HERO */}
      <Section title="Hero" desc="Top headline, subtitle and buttons" open={openSection === "hero"} onToggle={() => toggle("hero")}>
        <Field label="Badge (small text above headline)" value={c.hero.badge} onChange={(v) => set("hero", { ...c.hero, badge: v })} />
        <Field label="Headline — first part" value={c.hero.titleBefore} onChange={(v) => set("hero", { ...c.hero, titleBefore: v })} hint="Normal color text." />
        <Field label="Headline — highlighted part (red)" value={c.hero.titleHighlight} onChange={(v) => set("hero", { ...c.hero, titleHighlight: v })} hint="Shown in red accent color." />
        <Field label="Subtitle" value={c.hero.subtitle} onChange={(v) => set("hero", { ...c.hero, subtitle: v })} textarea rows={3} />
        <Field label="Button 1 text" value={c.hero.cta1Text} onChange={(v) => set("hero", { ...c.hero, cta1Text: v })} />
        <Field label="Button 1 WhatsApp message" value={c.hero.cta1Message} onChange={(v) => set("hero", { ...c.hero, cta1Message: v })} textarea rows={2} hint="Pre-filled message sent when visitors click." />
        <Field label="Button 2 text" value={c.hero.cta2Text} onChange={(v) => set("hero", { ...c.hero, cta2Text: v })} />
        <Field label="Small line under buttons" value={c.hero.metaLine} onChange={(v) => set("hero", { ...c.hero, metaLine: v })} />
      </Section>

      {/* STATS */}
      <Section title="Stats strip" desc="The 4 numbers under the hero" open={openSection === "stats"} onToggle={() => toggle("stats")}>
        <ListEditor
          items={c.stats}
          onChange={(v) => set("stats", v)}
          addLabel="Add stat"
          blank={{ value: "", label: "" }}
          minItems={1}
          renderItem={(s, on) => (
            <>
              <Field label="Number" value={s.value} onChange={(v) => on({ ...s, value: v })} />
              <Field label="Label" value={s.label} onChange={(v) => on({ ...s, label: v })} />
            </>
          )}
        />
      </Section>

      {/* SERVICES */}
      <Section title="Services" desc="The 3 service cards" open={openSection === "services"} onToggle={() => toggle("services")}>
        <Field label="Kicker" value={c.servicesHeader.kicker} onChange={(v) => set("servicesHeader", { ...c.servicesHeader, kicker: v })} />
        <Field label="Title" value={c.servicesHeader.title} onChange={(v) => set("servicesHeader", { ...c.servicesHeader, title: v })} />
        <Field label="Intro" value={c.servicesHeader.intro} onChange={(v) => set("servicesHeader", { ...c.servicesHeader, intro: v })} textarea rows={2} />
        <ListEditor
          items={c.services}
          onChange={(v) => set("services", v)}
          addLabel="Add service"
          blank={{ title: "", text: "", tag: "" }}
          minItems={1}
          renderItem={(s, on) => (
            <>
              <Field label="Title" value={s.title} onChange={(v) => on({ ...s, title: v })} />
              <Field label="Description" value={s.text} onChange={(v) => on({ ...s, text: v })} textarea rows={3} />
              <Field label="Tag line" value={s.tag} onChange={(v) => on({ ...s, tag: v })} />
            </>
          )}
        />
      </Section>

      {/* PROCESS */}
      <Section title="Process" desc="The 4 steps" open={openSection === "process"} onToggle={() => toggle("process")}>
        <Field label="Kicker" value={c.processHeader.kicker} onChange={(v) => set("processHeader", { ...c.processHeader, kicker: v })} />
        <Field label="Title" value={c.processHeader.title} onChange={(v) => set("processHeader", { ...c.processHeader, title: v })} />
        <Field label="Intro" value={c.processHeader.intro} onChange={(v) => set("processHeader", { ...c.processHeader, intro: v })} textarea rows={2} />
        <ListEditor
          items={c.process}
          onChange={(v) => set("process", v)}
          addLabel="Add step"
          blank={{ title: "", text: "" }}
          minItems={1}
          renderItem={(s, on) => (
            <>
              <Field label="Step title" value={s.title} onChange={(v) => on({ ...s, title: v })} />
              <Field label="Step text" value={s.text} onChange={(v) => on({ ...s, text: v })} textarea rows={3} />
            </>
          )}
        />
      </Section>

      {/* WHY */}
      <Section title="Why SEORankGulf" desc="The 4 reason cards" open={openSection === "why"} onToggle={() => toggle("why")}>
        <Field label="Kicker" value={c.whyHeader.kicker} onChange={(v) => set("whyHeader", { ...c.whyHeader, kicker: v })} />
        <Field label="Title" value={c.whyHeader.title} onChange={(v) => set("whyHeader", { ...c.whyHeader, title: v })} />
        <Field label="Intro" value={c.whyHeader.intro} onChange={(v) => set("whyHeader", { ...c.whyHeader, intro: v })} textarea rows={2} />
        <ListEditor
          items={c.why}
          onChange={(v) => set("why", v)}
          addLabel="Add reason"
          blank={{ title: "", text: "", tag: "" }}
          minItems={1}
          renderItem={(s, on) => (
            <>
              <Field label="Title" value={s.title} onChange={(v) => on({ ...s, title: v })} />
              <Field label="Text" value={s.text} onChange={(v) => on({ ...s, text: v })} textarea rows={3} />
              <Field label="Tag" value={s.tag} onChange={(v) => on({ ...s, tag: v })} />
            </>
          )}
        />
      </Section>

      {/* RESULTS */}
      <Section title="Results" desc="What-to-expect cards" open={openSection === "results"} onToggle={() => toggle("results")}>
        <Field label="Kicker" value={c.resultsHeader.kicker} onChange={(v) => set("resultsHeader", { ...c.resultsHeader, kicker: v })} />
        <Field label="Title" value={c.resultsHeader.title} onChange={(v) => set("resultsHeader", { ...c.resultsHeader, title: v })} />
        <Field label="Intro" value={c.resultsHeader.intro} onChange={(v) => set("resultsHeader", { ...c.resultsHeader, intro: v })} textarea rows={2} />
        <ListEditor
          items={c.results}
          onChange={(v) => set("results", v)}
          addLabel="Add result"
          blank={{ metric: "", title: "", text: "" }}
          minItems={1}
          renderItem={(s, on) => (
            <>
              <Field label="Metric (big red text)" value={s.metric} onChange={(v) => on({ ...s, metric: v })} />
              <Field label="Title" value={s.title} onChange={(v) => on({ ...s, title: v })} />
              <Field label="Text" value={s.text} onChange={(v) => on({ ...s, text: v })} textarea rows={2} />
            </>
          )}
        />
      </Section>

      {/* PRICING */}
      <Section title="Pricing" desc="Plans, prices and features" open={openSection === "pricing"} onToggle={() => toggle("pricing")}>
        <Field label="Kicker" value={c.pricingHeader.kicker} onChange={(v) => set("pricingHeader", { ...c.pricingHeader, kicker: v })} />
        <Field label="Title" value={c.pricingHeader.title} onChange={(v) => set("pricingHeader", { ...c.pricingHeader, title: v })} />
        <Field label="Intro" value={c.pricingHeader.intro} onChange={(v) => set("pricingHeader", { ...c.pricingHeader, intro: v })} textarea rows={2} />
        <ListEditor
          items={c.pricing}
          onChange={(v) => set("pricing", v)}
          addLabel="Add plan"
          blank={{ name: "", price: "", period: "/month", features: [], popular: false }}
          minItems={1}
          renderItem={(p, on) => (
            <>
              <Field label="Plan name" value={p.name} onChange={(v) => on({ ...p, name: v })} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Price" value={p.price} onChange={(v) => on({ ...p, price: v })} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Period" value={p.period} onChange={(v) => on({ ...p, period: v })} />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: ".9rem", fontWeight: 600 }}>
                <input type="checkbox" checked={p.popular} onChange={(e) => on({ ...p, popular: e.target.checked })} />
                Mark as “Most Popular”
              </label>
              <span style={{ display: "block", fontWeight: 600, fontSize: ".85rem", marginBottom: 6 }}>Features (one per line)</span>
              <textarea
                value={p.features.join("\n")}
                onChange={(e) => on({ ...p, features: e.target.value.split("\n") })}
                rows={Math.max(3, p.features.length + 1)}
                style={inputStyle}
              />
            </>
          )}
        />
      </Section>

      {/* TESTIMONIALS */}
      <Section title="Testimonials" desc="Client quotes" open={openSection === "testimonials"} onToggle={() => toggle("testimonials")}>
        <Field label="Kicker" value={c.testimonialsHeader.kicker} onChange={(v) => set("testimonialsHeader", { ...c.testimonialsHeader, kicker: v })} />
        <Field label="Title" value={c.testimonialsHeader.title} onChange={(v) => set("testimonialsHeader", { ...c.testimonialsHeader, title: v })} />
        <Field label="Intro" value={c.testimonialsHeader.intro} onChange={(v) => set("testimonialsHeader", { ...c.testimonialsHeader, intro: v })} textarea rows={2} />
        <ListEditor
          items={c.testimonials}
          onChange={(v) => set("testimonials", v)}
          addLabel="Add testimonial"
          blank={{ quote: "", name: "", role: "" }}
          renderItem={(t, on) => (
            <>
              <Field label="Quote" value={t.quote} onChange={(v) => on({ ...t, quote: v })} textarea rows={3} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Name" value={t.name} onChange={(v) => on({ ...t, name: v })} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Role / City" value={t.role} onChange={(v) => on({ ...t, role: v })} />
                </div>
              </div>
            </>
          )}
        />
      </Section>

      {/* FAQ */}
      <Section title="FAQ" desc="Homepage questions & answers" open={openSection === "faq"} onToggle={() => toggle("faq")}>
        <Field label="Kicker" value={c.faqHeader.kicker} onChange={(v) => set("faqHeader", { ...c.faqHeader, kicker: v })} />
        <Field label="Title" value={c.faqHeader.title} onChange={(v) => set("faqHeader", { ...c.faqHeader, title: v })} />
        <ListEditor
          items={c.faqs}
          onChange={(v) => set("faqs", v)}
          addLabel="Add FAQ"
          blank={{ q: "", a: "" }}
          renderItem={(f, on) => (
            <>
              <Field label="Question" value={f.q} onChange={(v) => on({ ...f, q: v })} />
              <Field label="Answer" value={f.a} onChange={(v) => on({ ...f, a: v })} textarea rows={3} />
            </>
          )}
        />
      </Section>

      {/* CONTACT */}
      <Section title="Contact CTA" desc="The WhatsApp call-to-action section" open={openSection === "contact"} onToggle={() => toggle("contact")}>
        <Field label="Kicker" value={c.contact.kicker} onChange={(v) => set("contact", { ...c.contact, kicker: v })} />
        <Field label="Title" value={c.contact.title} onChange={(v) => set("contact", { ...c.contact, title: v })} />
        <Field label="Subtitle" value={c.contact.sub} onChange={(v) => set("contact", { ...c.contact, sub: v })} textarea rows={2} />
        <Field label="Button text" value={c.contact.ctaText} onChange={(v) => set("contact", { ...c.contact, ctaText: v })} />
        <Field label="WhatsApp message" value={c.contact.ctaMessage} onChange={(v) => set("contact", { ...c.contact, ctaMessage: v })} textarea rows={2} />
        <Field label="Note under button" value={c.contact.note} onChange={(v) => set("contact", { ...c.contact, note: v })} />
      </Section>

      {/* FOOTER + WHATSAPP */}
      <Section title="Footer & WhatsApp" desc="Footer text, offices, and your WhatsApp number" open={openSection === "footer"} onToggle={() => toggle("footer")}>
        <Field
          label="WhatsApp number (digits only)"
          value={waNumber}
          onChange={setWaNumber}
          hint="Your real business number, e.g. 971501234567. Used by every WhatsApp button on the site."
        />
        <Field
          label="WhatsApp number as shown in footer"
          value={waDisplay}
          onChange={setWaDisplay}
          hint="How visitors see it, e.g. +971-50-123-4567."
        />
        <Field label="Footer tagline" value={c.footer.tagline} onChange={(v) => set("footer", { ...c.footer, tagline: v })} />
        <Field label="Working hours" value={c.footer.hours} onChange={(v) => set("footer", { ...c.footer, hours: v })} />
        <ListEditor
          items={c.footer.offices}
          onChange={(v) => set("footer", { ...c.footer, offices: v })}
          addLabel="Add office"
          blank={{ city: "", text: "" }}
          renderItem={(o, on) => (
            <>
              <Field label="City" value={o.city} onChange={(v) => on({ ...o, city: v })} />
              <Field label="Description" value={o.text} onChange={(v) => on({ ...o, text: v })} textarea rows={2} />
            </>
          )}
        />
        <Field label="Copyright line" value={c.footer.copyright} onChange={(v) => set("footer", { ...c.footer, copyright: v })} />
      </Section>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            background: "#E63946",
            color: "#fff",
            padding: "12px 32px",
            borderRadius: 10,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}
