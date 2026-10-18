/**
 * Site-wide contact configuration.
 *
 * ============================================================
 * ⚠️  CONFIGURE THIS BEFORE GOING LIVE WITH CTAs
 * ============================================================
 * Replace WHATSAPP_NUMBER with the real business WhatsApp number.
 * Format: full international number, DIGITS ONLY — no "+", no spaces,
 * no dashes. Example: "971501234567" for a UAE mobile.
 *
 * This one constant powers:
 *  - the floating WhatsApp button on blog articles
 *  - the mid-article and end-of-article CTA WhatsApp buttons
 *  - the pre-filled chat message for each
 *
 * Until replaced, all WhatsApp buttons point at the placeholder below
 * and are clearly non-functional for real customers.
 */
export const WHATSAPP_NUMBER = "971500000000";

/** Build a wa.me click-to-chat link with a pre-filled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
