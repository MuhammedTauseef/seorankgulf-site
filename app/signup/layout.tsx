import type { Metadata } from "next";

/**
 * /signup — account creation. Utility page: not indexed, unique metadata
 * (previously inherited the homepage title/description/canonical).
 * robots.txt does NOT disallow this route, so Google can read the noindex.
 */
export const metadata: Metadata = {
  title: "Create your account — SEORankGulf",
  description:
    "Create a SEORankGulf account to track your enquiries, request a free SEO audit and follow your campaign progress.",
  alternates: {
    canonical: "https://seorankgulf-site.vercel.app/signup",
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
