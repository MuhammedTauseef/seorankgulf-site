"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Mobile hamburger menu (3 lines). Opens a dropdown panel with all the
 * important links — same destinations as the footer — so phone visitors
 * can reach everything without scrolling to the bottom.
 * Auth-aware: signed-in users see Dashboard/Admin + Sign out instead of Log in.
 */
const BASE_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Services", href: "#services" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammadtauseef9", external: true },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  // undefined = still checking, null = signed out, string = role
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setRole(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      setRole((profile as { role?: string } | null)?.role ?? "client");
    }

    // Subscribe first so we never miss the session event that fires
    // right after an OAuth redirect.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        check();
      } else if (event === "SIGNED_OUT") {
        setRole(null);
      }
    });

    check();
    const retryTimer = setTimeout(() => {
      if (cancelled) return;
      setRole((prev) => {
        if (prev === null) check();
        return prev;
      });
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  async function signOut() {
    setOpen(false);
    try {
      const supabase = createClient();
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      // ignore — navigate home anyway
    }
    window.location.href = "/";
  }

  const authLink: { label: string; href: string; external?: boolean } =
    role === "admin"
      ? { label: "Admin panel", href: "/admin" }
      : role
        ? { label: "Dashboard", href: "/dashboard" }
        : { label: "Log in", href: "/login" };
  const links = [...BASE_LINKS, authLink];

  return (
    <div className="mobile-nav">
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
              {...(l.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {l.label}
            </a>
          ))}
          {role && (
            <button type="button" role="menuitem" onClick={signOut}>
              Sign out
            </button>
          )}
          <a
            href="#contact"
            className="btn btn-gold mobile-cta"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Get Free SEO Audit
          </a>
        </div>
      )}
    </div>
  );
}
