/**
 * GA4 event helper. Safe no-op when gtag is absent (ad blockers, SSR).
 *
 * Events are queued in dataLayer by the gtag snippet in app/layout.tsx.
 * GA4 records them once the visitor grants consent (Consent Mode v2 —
 * analytics_storage is denied by default, granted via CookieConsent).
 * Analytics must never break page interaction, so every failure is
 * swallowed here.
 */
export type GaEventParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: GaEventParams): void {
  try {
    if (typeof window === "undefined") return;
    const gtag = (
      window as unknown as { gtag?: (...args: unknown[]) => void }
    ).gtag;
    if (typeof gtag === "function") {
      gtag("event", name, params ?? {});
    }
  } catch {
    // Analytics must never break page interaction.
  }
}
