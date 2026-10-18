import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 } as const;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return { error: "Admins only.", status: 403 } as const;
  }
  return { ok: true } as const;
}

/** GET /api/admin/users — list all registered users with emails (admin only). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Service not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  // Get all auth users
  const { data: usersData, error: usersError } =
    await service.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }

  // Get profiles for roles
  const { data: profiles } = await service
    .from("profiles")
    .select("id, full_name, role, created_at");

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  // Get clients for business info
  const { data: clients } = await service
    .from("clients")
    .select("user_id, business_name, subscription_status");

  const clientMap = new Map(
    (clients || []).map((c: any) => [c.user_id, c])
  );

  // Get payment summary per user email
  const { data: payments } = await service
    .from("payments")
    .select("buyer_email, status, amount_cents")
    .eq("status", "succeeded");

  const paidEmails = new Set(
    (payments || []).map((p: any) => (p.buyer_email || "").toLowerCase())
  );

  const users = (usersData?.users || []).map((u: any) => {
    const profile = profileMap.get(u.id);
    const client = clientMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      full_name: profile?.full_name || u.user_metadata?.full_name || "—",
      role: profile?.role || "client",
      business_name: client?.business_name || "—",
      subscription_status: client?.subscription_status || "none",
      has_paid: paidEmails.has((u.email || "").toLowerCase()),
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      email_confirmed: !!u.email_confirmed_at,
    };
  });

  // Sort by newest first
  users.sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ users, total: users.length });
}

/** PATCH /api/admin/users — change a user's role (admin only).
 * Body: { user_id: string, role: "admin" | "client" }
 * Safeguards: cannot demote yourself, cannot demote the last admin.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { user_id?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { user_id, role } = body;
  if (!user_id || typeof user_id !== "string") {
    return NextResponse.json({ error: "user_id required." }, { status: 400 });
  }
  if (role !== "admin" && role !== "client") {
    return NextResponse.json({ error: "role must be 'admin' or 'client'." }, { status: 400 });
  }

  // Cannot change your own role (prevents accidental lockout).
  const supabase = await createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  if (me && me.id === user_id) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Service not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  // Cannot demote the last remaining admin.
  if (role === "client") {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count || 0) <= 1) {
      return NextResponse.json({ error: "Cannot demote the last admin." }, { status: 400 });
    }
  }

  const { error } = await service
    .from("profiles")
    .update({ role })
    .eq("id", user_id);
  if (error) {
    console.error("[admin/users] role update failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Role update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id, role });
}

/** DELETE /api/admin/users?user_id=xxx — delete a user (admin only).
 * Safeguards: cannot delete yourself, cannot delete the last admin.
 * Note: deletes the auth user; related rows cascade per FK constraints.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) {
    return NextResponse.json({ error: "user_id required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user: me } } = await supabase.auth.getUser();
  if (me && me.id === user_id) {
    return NextResponse.json({ error: "You cannot delete yourself." }, { status: 400 });
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Service not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  // Cannot delete the last admin.
  const { data: target } = await service
    .from("profiles")
    .select("role")
    .eq("id", user_id)
    .single();
  if ((target as { role?: string } | null)?.role === "admin") {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count || 0) <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin." }, { status: 400 });
    }
  }

  const { error } = await service.auth.admin.deleteUser(user_id);
  if (error) {
    console.error("[admin/users] delete failed:", error.message.slice(0, 200));
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id });
}
