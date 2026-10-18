import type { Metadata } from "next";

/**
 * /forgot-password — password-reset request. Utility page: not indexed,
 * unique metadata (previously inherited the homepage title/description).
 * robots.txt does NOT disallow this route, so Google can read the noindex.
 */
export const metadata: Metadata = {
  title: "Reset password — ReplyPilot",
  description:
    "Request a secure password-reset link for your ReplyPilot account.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/forgot-password",
  },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
