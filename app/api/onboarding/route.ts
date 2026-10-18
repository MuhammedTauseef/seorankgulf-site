import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Build the agent system prompt from onboarding data. */
function buildAgentConfig(data: {
  business_name: string;
  industry: string;
  website: string;
  business_description: string;
  services: { name: string; price: string }[];
  faqs: { q: string; a: string }[];
  whatsapp_number: string;
}) {
  const servicesText = data.services
    .map((s) => `- ${s.name}${s.price ? ` (${s.price})` : ""}`)
    .join("\n");
  const faqsText = data.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  const systemPrompt = `You are the AI assistant for ${data.business_name}, a ${data.industry} business.
${data.business_description ? `About: ${data.business_description}` : ""}
${data.website ? `Website: ${data.website}` : ""}

SERVICES & PRICES:
${servicesText || "Ask the business for details."}

FREQUENTLY ASKED QUESTIONS:
${faqsText || "Answer helpfully based on the business info above."}

RULES:
- Be warm, friendly, and concise — like a helpful team member.
- Answer ONLY from the business info above. Never invent prices, services, or policies.
- If you don't know something, say so honestly and offer to have the team follow up.
- When someone wants to book or buy, collect their name and contact, confirm details, and say the team will confirm shortly.
- Keep replies short (2-4 sentences) unless the customer asks for detail.
- Never mention you are AI unless asked.`;

  return {
    business_name: data.business_name,
    industry: data.industry,
    system_prompt: systemPrompt,
    greeting: `Hi! Thanks for reaching out to ${data.business_name}. How can I help you today?`,
    whatsapp_number: data.whatsapp_number,
    services: data.services,
    faqs: data.faqs,
    generated_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    // Server-side length caps — client-side trim alone is not enough.
    const str = (v: unknown, max: number) =>
      typeof v === "string" ? v.trim().slice(0, max) : "";
    const arr = (v: unknown, maxItems: number) =>
      Array.isArray(v) ? v.slice(0, maxItems) : [];
    const business_name = str(body.business_name, 120);
    const industry = str(body.industry, 120);
    const website = str(body.website, 200);
    const business_description = str(body.business_description, 2000);
    const whatsapp_number = str(body.whatsapp_number, 40);
    const services = arr(body.services, 50).map((s) => ({
      name: str(s?.name, 120),
      price: str(s?.price, 60),
    }));
    const faqs = arr(body.faqs, 50).map((f) => ({
      q: str(f?.q, 300),
      a: str(f?.a, 1000),
    }));

    if (!business_name || !industry || !whatsapp_number) {
      return NextResponse.json({ error: "Business name, industry, and WhatsApp number are required." }, { status: 400 });
    }

    const agentConfig = buildAgentConfig({
      business_name,
      industry,
      website,
      business_description,
      services,
      faqs,
      whatsapp_number,
    });

    const { error } = await supabase.from("clients").upsert(
      {
        user_id: user.id,
        business_name,
        industry,
        website: website || null,
        business_description: business_description || null,
        services,
        faqs,
        whatsapp_number,
        agent_config: agentConfig,
        agent_status: "preview",
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("onboarding error:", e);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
