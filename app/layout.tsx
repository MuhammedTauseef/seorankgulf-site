import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "@/components/CookieConsent";
import { safeJsonLd } from "@/lib/json-ld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://seorankgulf.com"),
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
    url: "https://seorankgulf.com",
    siteName: "SEORankGulf",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEORankGulf — We Rank Gulf Businesses on Google's First Page",
    description:
      "SEO services for UAE & Gulf businesses. Free SEO audit.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                  url: "https://seorankgulf.com/",
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
                  url: "https://seorankgulf.com/",
                  inLanguage: "en",
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
