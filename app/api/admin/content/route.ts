import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerAutoDeploy } from "@/lib/auto-deploy";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/site-content";

async function requireAdmin() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet. Set up the database first.", status: 503 } as const;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return { error: "Admins only.", status: 403 } as const;
  }
  return { supabase };
}

function sanitizeContent(input: unknown): SiteContent {
  const c = (input || {}) as Record<string, unknown>;
  const str = (v: unknown, max = 2000) =>
    typeof v === "string" ? v.slice(0, max) : "";
  const arr = <T,>(v: unknown, map: (x: Record<string, unknown>) => T): T[] =>
    Array.isArray(v) ? v.slice(0, 30).map((x) => map((x || {}) as Record<string, unknown>)) : [];

  const hero = (c.hero || {}) as Record<string, unknown>;
  const contact = (c.contact || {}) as Record<string, unknown>;
  const footer = (c.footer || {}) as Record<string, unknown>;
  const faqHeader = (c.faqHeader || {}) as Record<string, unknown>;

  const sectionHeader = (v: unknown) => {
    const h = (v || {}) as Record<string, unknown>;
    return {
      kicker: str(h.kicker, 120),
      title: str(h.title, 200),
      intro: str(h.intro, 2000),
    };
  };

  return {
    hero: {
      badge: str(hero.badge, 120),
      titleBefore: str(hero.titleBefore, 200),
      titleHighlight: str(hero.titleHighlight, 200),
      subtitle: str(hero.subtitle, 2000),
      cta1Text: str(hero.cta1Text, 120),
      cta1Message: str(hero.cta1Message, 500),
      cta2Text: str(hero.cta2Text, 120),
      metaLine: str(hero.metaLine, 300),
    },
    logosLabel: str(c.logosLabel, 200),
    stats: arr(c.stats, (s) => ({
      value: str(s.value, 60),
      label: str(s.label, 200),
    })),
    servicesHeader: sectionHeader(c.servicesHeader),
    services: arr(c.services, (s) => ({
      title: str(s.title, 120),
      text: str(s.text, 2000),
      tag: str(s.tag, 200),
    })),
    processHeader: sectionHeader(c.processHeader),
    process: arr(c.process, (s) => ({
      title: str(s.title, 120),
      text: str(s.text, 2000),
    })),
    whyHeader: sectionHeader(c.whyHeader),
    why: arr(c.why, (s) => ({
      title: str(s.title, 120),
      text: str(s.text, 2000),
      tag: str(s.tag, 200),
    })),
    resultsHeader: sectionHeader(c.resultsHeader),
    results: arr(c.results, (s) => ({
      metric: str(s.metric, 60),
      title: str(s.title, 200),
      text: str(s.text, 2000),
    })),
    pricingHeader: sectionHeader(c.pricingHeader),
    pricing: arr(c.pricing, (s) => ({
      name: str(s.name, 120),
      price: str(s.price, 60),
      period: str(s.period, 60),
      features: Array.isArray(s.features)
        ? s.features.slice(0, 30).map((f) => str(f, 300))
        : [],
      popular: s.popular === true,
    })),
    testimonialsHeader: sectionHeader(c.testimonialsHeader),
    testimonials: arr(c.testimonials, (s) => ({
      quote: str(s.quote, 2000),
      name: str(s.name, 120),
      role: str(s.role, 120),
    })),
    faqHeader: {
      kicker: str(faqHeader.kicker, 120),
      title: str(faqHeader.title, 200),
    },
    faqs: arr(c.faqs, (s) => ({
      q: str(s.q, 500),
      a: str(s.a, 2000),
    })),
    contact: {
      kicker: str(contact.kicker, 120),
      title: str(contact.title, 200),
      sub: str(contact.sub, 2000),
      ctaText: str(contact.ctaText, 120),
      ctaMessage: str(contact.ctaMessage, 500),
      note: str(contact.note, 300),
    },
    footer: {
      tagline: str(footer.tagline, 300),
      hours: str(footer.hours, 200),
      offices: arr(footer.offices, (s) => ({
        city: str(s.city, 120),
        text: str(s.text, 500),
      })),
      copyright: str(footer.copyright, 200),
    },
  };
}

/** GET /api/admin/content — current site content (merged with defaults) + WhatsApp settings. */
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data } = await auth.supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["homepage_content", "whatsapp_number", "whatsapp_display"]);

  const rows = (data || []) as Array<{ key: string; value: string }>;
  const byKey: Record<string, string> = {};
  for (const r of rows) byKey[r.key] = r.value;

  let content: SiteContent = DEFAULT_CONTENT;
  if (byKey.homepage_content) {
    try {
      content = { ...DEFAULT_CONTENT, ...(JSON.parse(byKey.homepage_content) as object) };
    } catch {
      content = DEFAULT_CONTENT;
    }
  }

  return NextResponse.json({
    content,
    whatsapp_number: byKey.whatsapp_number || "923150642491",
    whatsapp_display: byKey.whatsapp_display || "+92 315 0642491",
  });
}

/** PUT /api/admin/content — save site content + WhatsApp settings, then auto-deploy. */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const content = sanitizeContent(body.content);
  const waNumber = String(body.whatsapp_number || "").replace(/\D/g, "").slice(0, 20);
  const waDisplay = String(body.whatsapp_display || "").slice(0, 60);

  const upserts = [
    { key: "homepage_content", value: JSON.stringify(content) },
  ];
  if (waNumber) upserts.push({ key: "whatsapp_number", value: waNumber });
  if (waDisplay) upserts.push({ key: "whatsapp_display", value: waDisplay });

  for (const row of upserts) {
    const { error } = await auth.supabase
      .from("site_settings")
      .upsert({ key: row.key, value: row.value }, { onConflict: "key" });
    if (error) {
      return NextResponse.json(
        { error: `Save failed (${row.key}). Did you run supabase/site-content.sql?` },
        { status: 400 }
      );
    }
  }

  // Publish → live site rebuilds automatically (same system as blog/video publishing).
  await triggerAutoDeploy("site-content");

  return NextResponse.json({ ok: true });
}
