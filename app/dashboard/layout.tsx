import type { Metadata } from "next";
import DashboardNav from "@/components/DashboardNav";

/** Client dashboard — private, never indexed by search engines. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="admin-wrap" style={{ paddingTop: 26, paddingBottom: 0 }}>
        <DashboardNav />
      </div>
      {children}
    </>
  );
}
