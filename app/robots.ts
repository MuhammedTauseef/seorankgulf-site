import type { MetadataRoute } from "next";

/**
 * Public pages are crawlable; private areas are disallowed as a second
 * layer (the layouts also emit noindex meta tags).
 *
 * AI crawlers (GPTBot, ClaudeBot, Google-Extended, etc.) are explicitly
 * allowed so ChatGPT, Claude, and Gemini can cite ReplyPilot content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/onboarding/", "/api/"],
      },
      // AI training/search crawlers — explicitly allowed for GEO
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: [
      "https://seorankgulf.com/sitemap.xml",
      // Video entries for /videos (a static file in public/).
      // Submit in Search Console too: Sitemaps → Add /videos-sitemap.xml.
      "https://seorankgulf.com/videos-sitemap.xml",
    ],
  };
}
