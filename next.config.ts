import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  partialPrefetching: false,

  /**
   * Retired routes: the legacy AI-agent onboarding flow has been removed.
   * Send any old /onboarding links to the free SEO audit instead of a 404.
   */
  async redirects() {
    return [
      { source: "/onboarding", destination: "/seo-audit", permanent: false },
      {
        source: "/onboarding/:path*",
        destination: "/seo-audit",
        permanent: false,
      },
    ];
  },

  /**
   * Security headers applied to every response.
   * (CSP is intentionally not set globally — the inline widget styles and
   * Google Fonts need to load; the app has no user-generated HTML/JS.)
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // SEC-005 fix (2026-10-16): force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // SEC-004 fix (2026-10-16): baseline Content-Security-Policy.
          // Allows self, inline styles (widget), Google Fonts, Supabase, Vercel Analytics.
          // GA4 fix (2026-10-28): allow the Google tag script + GA4 collection
          // endpoints, otherwise the CSP silently blocks Google Analytics.
          // (img-src already allows all https:, so GA pixels need no entry.)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
