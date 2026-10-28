import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy (Next.js 16's renamed Middleware).
 *
 * - Refreshes the Supabase auth session on protected routes.
 * - /admin/*        → requires role = 'admin' (checked via profiles table).
 * - /dashboard/*    → requires any signed-in user.
 * - Signed-in users are bounced away from /login, /signup, /admin/login
 *   to their home dashboard.
 * - Fails closed when Supabase isn't configured yet.
 */

const PUBLIC_AUTH_PAGES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
]);

async function getRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return (data as { role: string }).role;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const isDashboard = pathname.startsWith("/dashboard");
    const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";
    if (isDashboard || isAdmin) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isDashboardArea = pathname.startsWith("/dashboard");
  if (!user && (isAdminArea || isDashboardArea)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && PUBLIC_AUTH_PAGES.has(pathname)) {
    const role = await getRole(supabase, user.id);
    const dest = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (user && isAdminArea) {
    const role = await getRole(supabase, user.id);
    if (role !== "admin") {
      // Clients must never reach the admin area.
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/signup"],
};
