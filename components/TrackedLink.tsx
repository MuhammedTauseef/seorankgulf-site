"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Anchor / Link that fires a GA4 event on click, then navigates normally
 * (no preventDefault — the click still follows the href).
 *
 * - variant="a" (default) renders a plain <a>: use where the existing
 *   element is a plain anchor (in-page #anchors, plain links).
 * - variant="link" renders next/link: use where the existing element is
 *   a next/link (cross-page client-side navigation).
 *
 * All props are plain serializable values so server components can use it.
 */
export default function TrackedLink({
  href,
  eventName,
  eventParams,
  variant = "a",
  className,
  style,
  children,
  target,
  rel,
  ariaLabel,
}: {
  href: string;
  eventName: string;
  eventParams: Record<string, string>;
  variant?: "a" | "link";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}) {
  const onClick = () => trackEvent(eventName, eventParams);

  if (variant === "link") {
    return (
      <Link
        href={href}
        className={className}
        style={style}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={onClick}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
