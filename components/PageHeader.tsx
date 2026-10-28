import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";
import AuthNav from "@/components/AuthNav";
import LogoMark from "@/components/LogoMark";

/**
 * Slim site header for content pages (/blog).
 * Same hamburger pattern as the homepage header: the bar keeps the brand,
 * the audit CTA and the theme toggle; all links + auth live in the panel.
 * Reuses .site-header styles from globals.css.
 */
export default function PageHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="SEORankGulf home">
          <span className="brand-mark"><LogoMark /></span>SEORANKGULF
        </Link>
        <div className="header-actions">
          <Link
            className="nav-cta"
            href="https://wa.me/923150642491?text=Hi!%20I%20want%20a%20free%20SEO%20audit%20for%20my%20business."
            target="_blank"
            rel="noopener"
          >
            Get Free SEO Audit
          </Link>
          <ThemeToggle />
          <MobileNav>
            <AuthNav />
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
