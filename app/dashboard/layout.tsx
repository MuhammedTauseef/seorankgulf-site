import type { Metadata } from "next";

/** Client dashboard — private, never indexed by search engines. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
