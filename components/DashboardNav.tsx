"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Client dashboard navigation — rendered by app/dashboard/layout.tsx so
 * every signed-in client page (home, billing, profile) carries the same
 * links. Before this, the sub-pages existed but were unreachable from
 * the dashboard UI.
 */
const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/client/billing", label: "Billing" },
  { href: "/dashboard/client/profile", label: "Profile" },
  { href: "/", label: "Back to website" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return false; // "Back to website" is an exit, never current.
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="dash-nav" aria-label="Your account">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "dash-nav-link active" : "dash-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
