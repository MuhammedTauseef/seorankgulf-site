import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FaqsClient from "./FaqsClient";

/** /admin/faqs — FAQ management (admin only). */
export default async function FaqsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <main className="admin-wrap">
      <div className="admin-top">
        <div>
          <h1>FAQs</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Manage frequently asked questions shown on the website.
          </p>
        </div>
        <a href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
          ← Dashboard
        </a>
      </div>
      <FaqsClient />
    </main>
  );
}
