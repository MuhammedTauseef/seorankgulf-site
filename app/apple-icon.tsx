import { ImageResponse } from "next/og";

/**
 * iOS apple-touch icon — generated at build/request time because the brand
 * mark lives as SVG (app/icon.svg) and a binary PNG cannot be maintained
 * through the text-only push flow. Same artwork as app/icon.svg /
 * components/LogoMark.tsx: three rising bars (#E63946) with the gold-soft
 * growth arrow (#ef6a76) on the navy (#0a172a) rounded square, drawn on the
 * icon's 64×64 grid scaled to 180×180.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a172a",
          borderRadius: 39,
        }}
      >
        {/* Rising bars — 64-grid rects ×2.8125, bottom-aligned at y=54. */}
        <div
          style={{
            position: "absolute",
            left: 48,
            top: 124,
            width: 24,
            height: 28,
            borderRadius: 6,
            background: "#E63946",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 101,
            width: 24,
            height: 51,
            borderRadius: 6,
            background: "#E63946",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 113,
            top: 79,
            width: 24,
            height: 73,
            borderRadius: 6,
            background: "#E63946",
          }}
        />
        {/* Growth arrow + arrowhead, same paths as app/icon.svg. */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 64 64"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d="M16 38 L27.5 30 L38.5 22.8 L47.5 16.5"
            stroke="#ef6a76"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M43.5 12.8 L51.5 12.8 L51.5 20.8 L46.2 15.6 Z" fill="#ef6a76" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
