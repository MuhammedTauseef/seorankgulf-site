import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";

/**
 * Slim site header for content pages (/blog).
 * Reuses .site-header/.site-nav styles from globals.css.
 */
export default function PageHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="SEORankGulf home">
          <span className="brand-mark">S</span>SEORANKGULF
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link className="nav-link" href="/blog">
            Blog
          </Link>
          <Link className="nav-link" href="/#services">
            Services
          </Link>
          <Link className="nav-link" href="/#pricing">
            Pricing
          </Link>
          <Link
            className="nav-cta"
            href="https://wa.me/971500000000?text=Hi!%20I%20want%20a%20free%20SEO%20audit%20for%20my%20business."
            target="_blank"
            rel="noopener"
          >
            Get Free SEO Audit
          </Link>
          <ThemeToggle />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
