import type { Metadata } from "next";

/**
 * /signup — account creation. Utility page: not indexed, unique metadata
 * (previously inherited the homepage title/description/canonical).
 * robots.txt does NOT disallow this route, so Google can read the noindex.
 */
export const metadata: Metadata = {
  title: "Create your account — ReplyPilot",
  description:
    "Create a ReplyPilot account to track your enquiries and manage your AI agent.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/signup",
  },
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
