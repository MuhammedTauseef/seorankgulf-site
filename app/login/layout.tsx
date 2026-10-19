import type { Metadata } from "next";

/**
 * /login — account sign-in. Utility page: not indexed, unique metadata
 * (previously inherited the homepage title/description/canonical).
 * robots.txt does NOT disallow this route, so Google can read the noindex.
 */
export const metadata: Metadata = {
  title: "Log in — SEORankGulf",
  description:
    "Log in to your SEORankGulf account to manage your AI agent and enquiries.",
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/login",
  },
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
