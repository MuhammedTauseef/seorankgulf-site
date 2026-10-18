import type { Metadata } from "next";

/** Onboarding flow — private, never indexed by search engines. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
