import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

/** /admin/users — user management (admin only). */
export default async function UsersPage() {
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
          <h1>Users</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Manage roles and accounts. You cannot change your own role or remove the last admin.
          </p>
        </div>
        <a href="/admin" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".9rem" }}>
          ← Dashboard
        </a>
      </div>
      <UsersClient currentUserId={user.id} />
    </main>
  );
}
