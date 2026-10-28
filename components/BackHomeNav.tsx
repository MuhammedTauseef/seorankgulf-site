"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Back / Home bar for public pages (owner order: every public page gets a
 * Back button and a Home button).
 *
 * Rendered once from the root layout, and again inside the two blog pages
 * (under <PageHeader />), so:
 *  - it SELF-HIDES on "/", "/admin/**", "/dashboard/**" and "/auth/**"
 *    (admin/dashboard have their own chrome; /auth/callback is a redirect
 *    interstitial; the homepage IS home), and
 *  - it also self-hides on "/blog" and "/blog/**" when rendered from the
 *    root layout, because the blog pages render their own instance directly
 *    under the site header (passing `inPage`) — otherwise blog pages would
 *    show the bar twice (once above the header, once below it).
 *
 * Back behaviour: a real history back (router.back()) when the visitor
 * arrived from another page of THIS site (same-origin document.referrer
 * and a history stack to go back through). When they landed directly on
 * the page (no referrer / external referrer / no history), Back falls
 * back to Home ("/") instead of leaving the site or doing nothing.
 *
 * SSR-safe: no window/document access during render — the referrer check
 * happens inside the click handler only.
 */
const HIDE_PREFIXES = ["/admin", "/dashboard", "/auth"];

export default function BackHomeNav({ inPage = false }: { inPage?: boolean }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  if (pathname === "/") return null;
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  // The root-layout instance steps aside on blog pages: the blog pages
  // render their own `inPage` instance directly under <PageHeader />.
  if (!inPage && (pathname === "/blog" || pathname.startsWith("/blog/"))) {
    return null;
  }

  function onBack() {
    try {
      const ref = document.referrer;
      const cameFromThisSite =
        !!ref && new URL(ref).origin === window.location.origin;
      if (cameFromThisSite && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    }
  }

  return (
    <div className="wrap back-home-wrap">
      <nav className="back-home-nav" aria-label="Page">
        <button type="button" className="back-home-btn" onClick={onBack}>
          ← Back
        </button>
        <Link href="/" className="back-home-btn">
          Home
        </Link>
      </nav>
    </div>
  );
}
