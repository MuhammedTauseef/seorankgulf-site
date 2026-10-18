import { createPublicClient } from "@/lib/supabase/public";

export interface Faq {
  question: string;
  answer: string;
}

/** Published FAQs from DB, in sort order. Falls back to hardcoded list. */
export async function getPublishedFaqs(): Promise<Faq[]> {
  const fallback: Faq[] = [
    {
      question: "Do I need technical skills?",
      answer: "No. I handle the build, setup, and testing, then show you the parts you need to know in plain language.",
    },
    {
      question: "What if customers prefer humans?",
      answer: "Human handoff is built in. The agent handles routine questions and passes the conversation to you or your team when a customer wants a person — or the situation needs judgment.",
    },
    {
      question: "What does the monthly care cover?",
      answer: "Hosting of the agent, updates, and support — that's my service fee. Your AI API usage and WhatsApp Business messaging charges (if used) are separate and billed directly by those providers.",
    },
  ];
  try {
    const supabase = createPublicClient();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data as Faq[];
  } catch {
    return fallback;
  }
}

/** Get a site setting value by key, with fallback. */
export async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return fallback;
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();
    const v = (data as { value?: string } | null)?.value;
    return v || fallback;
  } catch {
    return fallback;
  }
}
