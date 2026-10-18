import type { Metadata } from "next";

/**
 * /reset-password — set a new password via the emailed link. Utility page:
 * not indexed, unique metadata (previously inherited the homepage
 * title/description). robots.txt does NOT disallow this route, so Google
 * can read the noindex.
 */
export const metadata: Metadata = {
  title: "Choose a new password — ReplyPilot",
  description:
    "Set a new password for your ReplyPilot account using your reset link.",
  alternates: {
    canonical: "https://replypilot-site.vercel.app/reset-password",
  },
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
