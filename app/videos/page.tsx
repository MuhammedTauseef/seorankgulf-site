import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPublishedVideos } from "@/lib/videos";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Demo Videos — AI Agents in Action | ReplyPilot",
  description:
    "Watch ReplyPilot's AI sales agents in action: 30-second demos for boutiques, restaurants, salons, real estate, dental clinics, gyms, blogs, car dealerships, hotels, and fitness stores — WhatsApp, Instagram, website, and e-commerce automation.",
  keywords: [
    "AI agent demo videos",
    "WhatsApp automation demo",
    "Instagram DM automation demo",
    "AI chatbot demo",
    "website chatbot for blogs",
    "car dealership Instagram DM automation",
    "hotel booking chatbot demo",
    "fitness store AI assistant demo",
    "guest posting automation",
    "ReplyPilot",
  ],
  alternates: {
    canonical: "https://replypilot-site.vercel.app/videos",
  },
  openGraph: {
    url: "https://replypilot-site.vercel.app/videos",
    images: [
      {
        url: "https://replypilot-site.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ReplyPilot — AI Sales Agents for Small Business",
      },
    ],
  },
};

interface DemoVideo {
  file: string;
  poster?: string;
  niche: string;
  channel: string;
  title: string;
  description: string;
}


/** /videos — gallery of 30-second AI agent demo videos. */
export default async function VideosPage() {
  const videos = await getPublishedVideos();
  // VideoObject schema — ONLY fields supported by real video data.
  // No uploadDate / duration: that metadata is not stored with the
  // videos, and inventing it would be misleading structured data.
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ReplyPilot demo videos",
    itemListElement: videos.map((v, i) => ({
      "@type": "VideoObject",
      position: i + 1,
      name: v.title,
      description: v.description,
      ...(v.poster
        ? {
            thumbnailUrl: `https://replypilot-site.vercel.app${v.poster}`,
          }
        : {}),
      contentUrl: `https://replypilot-site.vercel.app${v.file}`,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(videoSchema) }}
      />
      <PageHeader />
      <main>
        <section className="hero" style={{ padding: 0 }}>
          <div
            className="wrap hero-inner"
            style={{ paddingTop: 72, paddingBottom: 56 }}
          >
            <span className="eyebrow">Demo videos</span>
            <h1
              className="hero-statement"
              style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}
            >
              Watch the agents work<span className="dot">.</span>
            </h1>
            <p className="hero-sub" style={{ maxWidth: "40ch" }}>
              30-second concept demos of the AI sales agents ReplyPilot builds
              for real businesses. Demos are fictional portfolio samples.
            </p>
          </div>
        </section>

        <section className="block" style={{ paddingTop: 64 }}>
          <div className="wrap">
            <div className="video-grid">
              {videos.map((v) => (
                <div key={v.file} className="video-card">
                  <video
                    controls
                    preload="none"
                    playsInline
                    poster={v.poster || undefined}
                    src={v.file}
                    aria-label={`${v.niche} AI agent demo video`}
                  />
                  <div className="video-body">
                    <small>{v.channel}</small>
                    <h3>
                      {v.niche} — {v.title}
                    </h3>
                    <p>{v.description}</p>
                    <Link href="/#contact" className="btn btn-navy">
                      Get one for my business
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
