/**
 * SEORankGulf logo mark — three rising bars with an upward "growth" arrow:
 * the SEO-ranking story in one glyph. Rendered inside the .brand-mark chip
 * (which supplies the navy rounded square); bars use currentColor (the
 * chip's gold), the arrow uses the gold-soft tint. The standalone favicon
 * (app/icon.svg) carries the same artwork on its own navy square.
 */
export default function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="17" y="44" width="8.5" height="10" rx="2" fill="currentColor" />
      <rect x="28.5" y="36" width="8.5" height="18" rx="2" fill="currentColor" />
      <rect x="40" y="28" width="8.5" height="26" rx="2" fill="currentColor" />
      <path
        d="M16 38 L27.5 30 L38.5 22.8 L47.5 16.5"
        stroke="#ef6a76"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M43.5 12.8 L51.5 12.8 L51.5 20.8 L46.2 15.6 Z" fill="#ef6a76" />
    </svg>
  );
}
