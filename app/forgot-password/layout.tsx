import type { Metadata } from "next";

/**
 * /forgot-password — password-reset request. Utility page: not indexed,
 * unique metadata (previously inherited the homepage title/description).
 * robots.txt does NOT disallow this route, so Google can read the noindex.
 */
export const metadata: Metadata = {
  title: "Reset password — SEORankGulf",
  description:
    "Request a secure password-reset link for your SEORankGulf account.",
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/forgot-password",
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
