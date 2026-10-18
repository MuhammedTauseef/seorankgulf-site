import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Slim site header for content pages (/blog, /videos).
 * Reuses .site-header/.site-nav styles from globals.css.
 */
export default function PageHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="ReplyPilot home">
          <span className="brand-mark">R</span>REPLYPILOT
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link className="nav-link" href="/blog">
            Blog
          </Link>
          <Link className="nav-link" href="/videos">
            Videos
          </Link>
          <Link className="nav-link" href="/demo">
            Live demos
          </Link>
          <Link className="nav-cta" href="/#contact">
            Get Your AI Agent
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
