"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Google Analytics 4 loader with Consent Mode v2.
 *
 * GA4 Measurement ID: PENDING FROM OWNER.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel (Production + Preview) once
 * the owner provides a valid GA4 property ID. Until then this component
 * renders nothing (safe no-op).
 *
 * - Reads the Measurement ID from NEXT_PUBLIC_GA_MEASUREMENT_ID.
 * - Renders NOTHING until that env var is set (safe no-op for local dev).
 * - Sets consent defaults from the visitor's stored cookie choice
 *   (seorankgulf-cookie-consent); analytics_storage stays 'denied'
 *   until the visitor clicks Accept in the CookieConsent banner.
 * - Fires a page_view on every client-side route change.
 *
 * Setup: create a GA4 property at https://analytics.google.com,
 * copy the Measurement ID (G-XXXXXXXXXX), and add it as
 * NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel (Production + Preview).
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CONSENT_KEY = "seorankgulf-cookie-consent";

/** Fires a GA4 page_view on every App Router navigation. */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;
    try {
      const gtag = (
        window as unknown as { gtag?: (...args: unknown[]) => void }
      ).gtag;
      if (typeof gtag === "function") {
        const query = searchParams?.toString();
        const pagePath = query ? `${pathname}?${query}` : pathname;
        gtag("config", GA_ID, { page_path: pagePath });
      }
    } catch {
      /* Analytics must never break page interaction. */
    }
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* gtag.js loader — deferred until after the page is interactive. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* Init: dataLayer + gtag + Consent Mode v2 defaults + config. */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          (function(){
            var stored = null;
            try { stored = localStorage.getItem('${CONSENT_KEY}'); } catch(e) {}
            var state = stored === 'accepted' ? 'granted' : 'denied';
            gtag('consent', 'default', {
              'ad_storage': state,
              'ad_user_data': state,
              'ad_personalization': state,
              'analytics_storage': state
            });
          })();
          gtag('config', '${GA_ID}', { 'anonymize_ip': true });
        `}
      </Script>
      {/* Track client-side navigations as page views. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
