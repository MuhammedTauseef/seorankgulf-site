import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, email: 160, businessType: 60, message: 2000 };

type LeadBody = {
  name?: unknown;
  email?: unknown;
  businessType?: unknown;
  message?: unknown;
  /** honeypot — real users never fill this */
  website?: unknown;
};

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * POST /api/leads — saves a contact-form enquiry to the `leads` table.
 * Public insert is allowed by Row Level Security; only authenticated
 * admin users can read the table.
 */
export async function POST(req: Request) {
  // 5 submissions per minute per IP — stops form spam bots.
  if (!rateLimit(`leads:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: silently accept spam bots without storing anything.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const businessType = clean(body.businessType, MAX.businessType);
  const message = clean(body.message, MAX.message);

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please write a short message (at least 10 characters)." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // If the visitor is signed in, link the enquiry to their account so it
  // appears in their client dashboard (RLS keeps it private to them).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("leads").insert({
    name,
    email,
    business_type: businessType || null,
    message,
    user_id: user?.id ?? null,
  });

  if (error) {
    return NextResponse.json(
      { error: "Could not save your message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
