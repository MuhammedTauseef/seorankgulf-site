"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/site-config";

/**
 * Mobile hamburger menu (3 lines). Opens a dropdown panel with the same
 * destinations as the desktop nav, so phone visitors can reach everything.
 * Visible only on small screens via CSS (.mobile-nav display rule).
 * Closes on: link click, Escape key, or click outside the menu.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Section anchors only work on the homepage — prefix with "/" elsewhere.
  const onHome = pathname === "/";
  const sec = (hash: string) => (onHome ? hash : `/${hash}`);

  const links = [
    { label: "Services", href: sec("#services") },
    { label: "Process", href: sec("#process") },
    { label: "Pricing", href: sec("#pricing") },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: sec("#faq") },
    { label: "Contact", href: sec("#contact") },
  ];

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
