import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import BackHomeNav from "@/components/BackHomeNav";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { safeJsonLd } from "@/lib/json-ld";
import "./globals.css";

// Self-hosted via next/font — no render-blocking Google Fonts @import.
const redHat = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-redhat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://seorankgulf-site.vercel.app"),
  title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
  description:
    "SEO services for UAE & Gulf businesses. Local SEO, technical SEO, and content SEO. Free SEO audit. Dubai, Abu Dhabi, Sharjah.",
  keywords: [
    "SEO services Dubai",
    "SEO agency UAE",
    "local SEO Dubai",
    "SEO company Abu Dhabi",
    "SEO Sharjah",
    "Gulf SEO",
    "SEORankGulf",
  ],
  openGraph: {
    title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
    description:
      "SEO services for UAE & Gulf businesses. Local SEO, technical SEO, content SEO. Free SEO audit.",
    type: "website",
    url: "https://seorankgulf-site.vercel.app",
    siteName: "SEORankGulf",
    images: [
      {
        url: "https://seorankgulf-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SEORankGulf — SEO Services for Gulf Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
    description:
      "SEO services for UAE & Gulf businesses. Free SEO audit.",
  },
  verification: {
    google: "jXx7jWarPskM3UN7e2YihwpzUjZAzKJim_fvKRz-kw8",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={redHat.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("seorankgulf-theme");if(!t){t="dark"}document.documentElement.dataset.theme=t}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "SEORankGulf",
                  url: "https://seorankgulf-site.vercel.app/",
                  description:
                    "SEORankGulf provides SEO services for Gulf businesses: local SEO, technical SEO, and content SEO for companies in Dubai, Abu Dhabi, Sharjah, and across the UAE.",
                  knowsAbout: [
                    "local SEO",
                    "technical SEO",
                    "content SEO",
                    "SEO for UAE businesses",
                    "Google Business Profile optimization",
                  ],
                },
                {
                  "@type": "WebSite",
                  name: "SEORankGulf",
                  url: "https://seorankgulf-site.vercel.app/",
                  inLanguage: "en",
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        {/* Back / Home bar on every public page (self-hides on /, /admin,
            /dashboard, /auth and on blog pages, which render their own). */}
        <BackHomeNav />
        {children}
        <GoogleAnalytics />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
