import { getSetting } from "@/lib/settings";

/**
 * WordPress-style site content CMS.
 *
 * All homepage + footer content lives in the `site_settings` table under the
 * `homepage_content` key (JSON). The admin editor at /admin/content edits it.
 * The homepage reads it via getSiteContent() and falls back to DEFAULT_CONTENT
 * when Supabase isn't configured or the key is missing — so the site always
 * renders.
 */

export interface HeroContent {
  badge: string;
  titleBefore: string;
  titleHighlight: string;
  subtitle: string;
  cta1Text: string;
  cta1Message: string;
  cta2Text: string;
  metaLine: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ServiceItem {
  title: string;
  text: string;
  tag: string;
}

export interface SectionHeader {
  kicker: string;
  title: string;
  intro: string;
}

export interface ProcessStep {
  title: string;
  text: string;
}

export interface WhyItem {
  title: string;
  text: string;
  tag: string;
}

export interface ResultItem {
  metric: string;
  title: string;
  text: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface OfficeItem {
  city: string;
  text: string;
}

export interface SiteContent {
  hero: HeroContent;
  logosLabel: string;
  stats: StatItem[];
  servicesHeader: SectionHeader;
  services: ServiceItem[];
  processHeader: SectionHeader;
  process: ProcessStep[];
  whyHeader: SectionHeader;
  why: WhyItem[];
  resultsHeader: SectionHeader;
  results: ResultItem[];
  pricingHeader: SectionHeader;
  pricing: PricingPlan[];
  testimonialsHeader: SectionHeader;
  testimonials: Testimonial[];
  faqHeader: { kicker: string; title: string };
  faqs: FaqItem[];
  contact: {
    kicker: string;
    title: string;
    sub: string;
    ctaText: string;
    ctaMessage: string;
    note: string;
  };
  footer: {
    tagline: string;
    hours: string;
    offices: OfficeItem[];
    copyright: string;
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: "SEO for the Gulf",
    titleBefore: "We Rank Gulf Businesses on ",
    titleHighlight: "Google's First Page",
    subtitle:
      "Local SEO, technical SEO, and content SEO for UAE businesses in Dubai, Abu Dhabi, and Sharjah. No fluff — just rankings that bring customers.",
    cta1Text: "Get Free SEO Audit",
    cta1Message: "Hi! I want a free SEO audit for my business.",
    cta2Text: "See Pricing",
    metaLine: "Dubai · Abu Dhabi · Sharjah · Month-to-month plans",
  },
  logosLabel: "Trusted by growing businesses across the Gulf",
  stats: [
    { value: "50+", label: "Keywords ranked on page one" },
    { value: "3", label: "Emirates served across the UAE" },
    { value: "100%", label: "White-hat methods, no shortcuts" },
    { value: "30-day", label: "First results window for most clients" },
  ],
  servicesHeader: {
    kicker: "Services",
    title: "SEO that actually moves the needle.",
    intro:
      "Three focused services. No bloated packages, no jargon — just the work that gets Gulf businesses found on Google.",
  },
  services: [
    {
      title: "Local SEO",
      text: "Google Business Profile optimization, local citations, and city-specific pages that put you on the map — literally. Built for Dubai, Abu Dhabi, and Sharjah search behavior.",
      tag: "Google Maps · Local rankings · Citations",
    },
    {
      title: "Technical SEO",
      text: "Full website audit and fixes: page speed, mobile-friendliness, crawlability, schema markup, and Core Web Vitals. The foundation Google rewards with higher rankings.",
      tag: "Audit · Speed · Schema · Core Web Vitals",
    },
    {
      title: "Content SEO",
      text: "Keyword research and SEO articles written to rank — in-depth, search-intent matched, with FAQs engineered to win featured snippets and AI answers.",
      tag: "Keywords · Articles · Featured snippets",
    },
  ],
  processHeader: {
    kicker: "How it works",
    title: "From audit to rankings in four steps.",
    intro:
      "A clear, repeatable process — you always know what's happening and why.",
  },
  process: [
    {
      title: "Free SEO Audit",
      text: "We analyze your website, competitors, and market — then send you a clear report of what's holding you back. Free, no strings attached.",
    },
    {
      title: "Strategy & Roadmap",
      text: "You get a plain-language plan: target keywords, technical fixes, and content calendar prioritized by impact.",
    },
    {
      title: "Execution",
      text: "We implement everything — technical fixes, on-page optimization, local citations, and ranking-focused content.",
    },
    {
      title: "Report & Refine",
      text: "Monthly reports show exactly what moved and why. We double down on what works, quarter after quarter.",
    },
  ],
  whyHeader: {
    kicker: "Why SEORankGulf",
    title: "Built for the Gulf, not adapted to it.",
    intro:
      "Most SEO advice is written for US or UK markets. We work where your customers are — and we know how search works here.",
  },
  why: [
    {
      title: "Gulf-market focus",
      text: "We understand bilingual search behavior, UAE directories, and how Google Business Profile works across the Emirates. You don't have to explain your market to us.",
      tag: "Local expertise",
    },
    {
      title: "Transparent reporting",
      text: "Every month you get a plain-language report: what we did, what moved, and what's next. No vanity metrics, no jargon walls.",
      tag: "Clear reports",
    },
    {
      title: "No long contracts",
      text: "Month-to-month plans. If we're not delivering value, you walk away — which is exactly why we work hard to deliver it.",
      tag: "Flexible terms",
    },
    {
      title: "Honest about timelines",
      text: "We won't promise page one in 30 days. We'll tell you what's realistic, then work the plan until it happens.",
      tag: "Realistic expectations",
    },
  ],
  resultsHeader: {
    kicker: "What to expect",
    title: "Realistic results, honestly communicated.",
    intro:
      "We don't sell miracles. Here's what proper SEO delivers for Gulf businesses.",
  },
  results: [
    {
      metric: "3–6 mo",
      title: "Typical ranking window",
      text: "Most clients see significant ranking gains within 3–6 months of consistent execution.",
    },
    {
      metric: "Page 1",
      title: "Local pack targeting",
      text: "We optimize for Google Maps and local results — where Gulf customers actually click.",
    },
    {
      metric: "100%",
      title: "White-hat only",
      text: "No link schemes, no keyword stuffing, no shortcuts that risk penalties. Ever.",
    },
  ],
  pricingHeader: {
    kicker: "Pricing",
    title: "Simple monthly plans. Cancel anytime.",
    intro:
      "Month-to-month. No long contracts. We earn your business with results.",
  },
  pricing: [
    {
      name: "Starter",
      price: "$300",
      period: "/month",
      features: [
        "Local SEO for 1 city",
        "Google Business Profile setup",
        "10 keywords tracked",
        "2 SEO articles / month",
        "Monthly report",
      ],
      popular: false,
    },
    {
      name: "Growth",
      price: "$600",
      period: "/month",
      features: [
        "Local SEO for 3 cities",
        "Technical SEO audit + fixes",
        "25 keywords tracked",
        "4 SEO articles / month",
        "Bi-weekly reports",
        "Competitor analysis",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$1,200",
      period: "/month",
      features: [
        "Multi-city + national SEO",
        "Full technical overhaul",
        "50 keywords tracked",
        "8 SEO articles / month",
        "Weekly reports + calls",
        "Dedicated strategist",
      ],
      popular: false,
    },
  ],
  testimonialsHeader: {
    kicker: "Client words",
    title: "What our clients say.",
    intro: "Real feedback from businesses we've helped get found.",
  },
  testimonials: [
    {
      quote:
        "Within four months our Google Business Profile started bringing in calls every week. The monthly reports made it easy to see exactly what was working.",
      name: "Restaurant Owner",
      role: "Dubai",
    },
    {
      quote:
        "They explained everything in plain language and never overpromised. Our main service page went from invisible to page one for our area.",
      name: "Clinic Manager",
      role: "Sharjah",
    },
    {
      quote:
        "The free audit alone showed us problems two previous agencies missed. Signing up was an easy decision after that.",
      name: "Retail Store Owner",
      role: "Abu Dhabi",
    },
  ],
  faqHeader: {
    kicker: "FAQ",
    title: "Straight answers before you decide.",
  },
  faqs: [
    {
      q: "How long does SEO take to show results?",
      a: "Most clients see initial improvements in 4-8 weeks (indexing, impressions). Significant ranking gains typically arrive in 3-6 months. SEO is a compounding investment — results grow over time.",
    },
    {
      q: "Do you guarantee first-page rankings?",
      a: "No honest SEO company can guarantee specific rankings — anyone who does is misleading you. What we guarantee is proven methodology: technical excellence, quality content, and consistent execution that gives you the best possible chance.",
    },
    {
      q: "Why focus on Gulf/UAE businesses?",
      a: "We specialize in the Gulf market: bilingual search considerations, local search behavior, Google Business Profile for UAE, and directories like Dubizzle and Yellow Pages UAE. Specialization beats generalization.",
    },
    {
      q: "What do you need from me to start?",
      a: "Just your website URL and business details. We handle the audit, strategy, and execution. You'll get a clear report each month showing exactly what was done and what improved.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. Our plans are month-to-month with no long-term lock-in. We earn your business every month with results, not contracts.",
    },
  ],
  contact: {
    kicker: "Get started",
    title: "Get your free SEO audit today.",
    sub: "We'll analyze your website and send you a clear report of what's holding you back — free, no strings attached.",
    ctaText: "Chat on WhatsApp",
    ctaMessage: "Hi! I want a free SEO audit for my business. My website is: ",
    note: "Serving Dubai, Abu Dhabi, Sharjah & across the Gulf.",
  },
  footer: {
    tagline: "SEO services for Gulf businesses. Dubai · Abu Dhabi · Sharjah.",
    hours: "Mon–Sat, 9am–6pm GST",
    offices: [
      {
        city: "Dubai",
        text: "Serving businesses across Dubai — Deira to JBR, Business Bay to Marina.",
      },
      {
        city: "Abu Dhabi",
        text: "Local SEO for the capital — Corniche to Yas Island and beyond.",
      },
      {
        city: "Sharjah",
        text: "Helping Sharjah businesses get found on Google Maps and search.",
      },
    ],
    copyright: "© 2026 SEORankGulf. All rights reserved.",
  },
};

/** Deep-merge saved JSON over defaults so new fields always have fallbacks. */
function mergeDeep<T>(base: T, over: unknown): T {
  if (over === null || over === undefined) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(over) ? over : base) as T;
  }
  if (typeof base === "object" && typeof over === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
      out[k] =
        k in out
          ? mergeDeep((out as Record<string, unknown>)[k], v)
          : v;
    }
    return out as T;
  }
  return over as T;
}

/** Homepage content from DB, merged over defaults. Never throws. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await getSetting("homepage_content", "");
    if (!raw) return DEFAULT_CONTENT;
    const parsed: unknown = JSON.parse(raw);
    return mergeDeep(DEFAULT_CONTENT, parsed);
  } catch {
    return DEFAULT_CONTENT;
  }
}

export const WHATSAPP_NUMBER_FALLBACK = "971500000000";
export const WHATSAPP_DISPLAY_FALLBACK = "+971-50-000-0000";

/** WhatsApp number (digits only) from DB, with fallback. */
export async function getWhatsappNumber(): Promise<string> {
  const v = await getSetting("whatsapp_number", WHATSAPP_NUMBER_FALLBACK);
  const digits = v.replace(/\D/g, "");
  return digits || WHATSAPP_NUMBER_FALLBACK;
}

/** WhatsApp display string (e.g. +971-50-123-4567) from DB, with fallback. */
export async function getWhatsappDisplay(): Promise<string> {
  return getSetting("whatsapp_display", WHATSAPP_DISPLAY_FALLBACK);
}
