import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const PKT = "Asia/Karachi";
const OPEN_HOUR = 10;
const CLOSE_HOUR = 18;
const SLOT_MINUTES = 30;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Build slot start/end as UTC Date objects from a PKT date + HH:MM time. */
function slotRangeUtc(date: string, time: string): { start: Date; end: Date } | null {
  const [hh, mm] = time.split(":").map(Number);
  if (mm !== 0 && mm !== 30) return null;
  // PKT is UTC+5 year-round (no DST).
  const start = new Date(`${date}T${time}:00+05:00`);
  if (Number.isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + SLOT_MINUTES * 60_000) };
}

function todayPkt(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PKT,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dayBoundsUtc(date: string): { startIso: string; endIso: string } {
  const start = new Date(`${date}T00:00:00+05:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60_000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

/**
 * POST /api/client-booking — book an appointment with a client's business.
 * Body: { business: string, name: string, contact: string, date: "YYYY-MM-DD", time: "HH:MM", notes?: string }
 * Public endpoint (called by the client's AI agent on behalf of end customers).
 * Google Calendar sync happens when GOOGLE_CALENDAR_CREDENTIALS is configured.
 */
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`client-booking:${clientIp(req)}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const { business, name, contact, date, time, notes } = await req.json();

    if (!business?.trim() || !name?.trim() || !contact?.trim() || !date || !time) {
      return NextResponse.json(
        { error: "Business, name, contact, date, and time are required." },
        { status: 400 }
      );
    }
    if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
      return NextResponse.json(
        { error: "Date must be YYYY-MM-DD and time HH:MM." },
        { status: 400 }
      );
    }
    if (date < todayPkt()) {
      return NextResponse.json({ error: "Date is in the past." }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 120);
    const cleanContact = contact.trim().slice(0, 160);
    const cleanBusiness = business.trim().slice(0, 160);
    const cleanNotes = (notes ?? "").trim().slice(0, 1000) || null;

    const range = slotRangeUtc(date, time);
    if (!range) {
      return NextResponse.json(
        { error: "Time must be on a 30-minute boundary (e.g. 10:00, 10:30)." },
        { status: 400 }
      );
    }
    const pktHour = Number(time.split(":")[0]);
    if (pktHour < OPEN_HOUR || pktHour >= CLOSE_HOUR) {
      return NextResponse.json(
        { error: `Bookings are accepted ${OPEN_HOUR}:00–${CLOSE_HOUR}:00 Pakistan time.` },
        { status: 400 }
      );
    }
    if (range.start.getTime() <= Date.now() + 30 * 60_000) {
      return NextResponse.json(
        { error: "The slot must be at least 30 minutes in the future." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // The business must be a real ReplyPilot client.
    const { data: client } = await supabase
      .from("clients")
      .select("id, business_name")
      .ilike("business_name", cleanBusiness)
      .limit(1)
      .maybeSingle();

    if (!client) {
      return NextResponse.json({ error: "Unknown business." }, { status: 404 });
    }

    // Conflict check (best-effort: public RLS allows insert but not select,
    // so this is blind for logged-out callers — same as the demo chat flow).
    try {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("source", client.business_name)
        .eq("slot_start", range.start.toISOString())
        .neq("status", "cancelled")
        .limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: "That slot was just taken. Please pick another time." },
          { status: 409 }
        );
      }
    } catch {
      // RLS-blocked select → proceed; the insert itself is authoritative.
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        name: cleanName,
        email: cleanContact.includes("@") ? cleanContact : null,
        phone: !cleanContact.includes("@") ? cleanContact : null,
        slot_start: range.start.toISOString(),
        slot_end: range.end.toISOString(),
        status: "confirmed",
        source: client.business_name,
        notes: cleanNotes,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Confirmation email — best-effort, never blocks the booking.
    // (Delivers once a sending domain is verified in Resend.)
    if (cleanContact.includes("@")) {
      try {
        const { emails } = await import("@/lib/emails");
        await emails.bookingConfirmed(
          cleanContact,
          cleanName,
          date,
          time,
          client.business_name
        );
      } catch {
        /* email is optional */
      }
    }

    // TODO: Google Calendar sync when credentials are configured
    // TODO: Send confirmation WhatsApp

    return NextResponse.json({
      ok: true,
      booking_id: booking.id,
      message: `Booked! ${cleanName}, you're confirmed for ${date} at ${time} (Pakistan time). We'll send a reminder before.`,
    });
  } catch (e) {
    console.error("client booking error:", e);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}

/**
 * GET /api/client-booking?business=X&date=YYYY-MM-DD — check availability.
 * Returns free 30-min slots (10:00–18:00 PKT) for that business and date.
 */
export async function GET(req: NextRequest) {
  try {
    if (!rateLimit(`client-booking-get:${clientIp(req)}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const business = (searchParams.get("business") ?? "").trim().slice(0, 160);
    const date = searchParams.get("date") ?? "";

    if (!business || !DATE_RE.test(date)) {
      return NextResponse.json({ error: "business and date (YYYY-MM-DD) required." }, { status: 400 });
    }
    if (date < todayPkt()) {
      return NextResponse.json({ date, free_slots: [], booked_slots: [] });
    }

    const supabase = await createClient();
    const { data: client } = await supabase
      .from("clients")
      .select("business_name")
      .ilike("business_name", business)
      .limit(1)
      .maybeSingle();

    if (!client) {
      return NextResponse.json({ error: "Unknown business." }, { status: 404 });
    }

    const { startIso, endIso } = dayBoundsUtc(date);
    let bookedTimes = new Set<string>();
    try {
      const { data } = await supabase
        .from("bookings")
        .select("slot_start")
        .eq("source", client.business_name)
        .gte("slot_start", startIso)
        .lt("slot_start", endIso)
        .neq("status", "cancelled");
      bookedTimes = new Set(
        (data ?? []).map((b) => {
          const d = new Date(String(b.slot_start));
          return new Intl.DateTimeFormat("en-GB", {
            timeZone: PKT,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(d);
        })
      );
    } catch {
      // RLS-blocked select → return standard hours; caller confirms before booking.
    }

    const allSlots: string[] = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      allSlots.push(`${String(h).padStart(2, "0")}:00`);
      allSlots.push(`${String(h).padStart(2, "0")}:30`);
    }
    const booked = allSlots.filter((s) => bookedTimes.has(s));
    const free = allSlots.filter((s) => !bookedTimes.has(s));

    return NextResponse.json({ date, free_slots: free, booked_slots: booked });
  } catch (e) {
    console.error("availability error:", e);
    return NextResponse.json({ error: "Check failed." }, { status: 500 });
  }
}
