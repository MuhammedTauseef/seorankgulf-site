"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/site-config";

/**
 * Hamburger menu used at EVERY width (desktop included, by owner request —
 * the old inline desktop link row crowded the header and wrapped badly).
 * The header bar keeps only the brand, the audit CTA, the theme toggle and
 * this button; all destinations live in the dropdown panel.
 * `children` is the auth area (AuthNav) rendered at the panel's foot, so
 * Log in / Admin / Dashboard + Sign out follow the same session rules as
 * before — Admin still only appears for a signed-in admin.
 * Closes on: link click, Escape key, route change, or click outside.
 */
export default function MobileNav({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Section anchors only work on the homepage — prefix with "/" elsewhere.
  const onHome = pathname === "/";
  const sec = (hash: string) => (onHome ? hash : `/${hash}`);

  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/seo-services" },
    { label: "Free Audit", href: "/seo-audit" },
    { label: "Pricing", href: sec("#pricing") },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: sec("#faq") },
    { label: "Contact", href: "/contact" },
  ];

  // Close when the route changes (client-side navigations included).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open ]);

  return (
    <div className="mobile-nav" ref={rootRef}>
      <button
        type="button"
        className={`burger${open ? " open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="mobile-menu" role="menu">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          {children && (
            <div className="mobile-auth" onClick={() => setOpen(false)}>
              {children}
            </div>
          )}
          <a
            href={whatsappLink("Hi! I want a free SEO audit for my business.")}
            className="btn btn-gold mobile-cta"
            role="menuitem"
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            Get Free SEO Audit
          </a>
        </div>
      )}
    </div>
  );
}
