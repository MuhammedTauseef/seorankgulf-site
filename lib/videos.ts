import { createPublicClient } from "@/lib/supabase/public";
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { videoSeoMeta } from "./videoSeo";

export interface DemoVideo {
  id: string;
  file: string;
  poster: string | null;
  niche: string;
  channel: string;
  title: string;
  description: string;
}

/** Published demo videos, in sort order (public read). */
export async function getPublishedVideos(): Promise<DemoVideo[]> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("videos")
      .select("id, file, poster, niche, channel, title, description")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      // DB rows stay the source of truth; merge in any deployed local
      // videos that lack a row yet (deduped by file path) so daily
      // uploads appear in the gallery immediately with full SEO.
      const dbFiles = new Set((data as DemoVideo[]).map((v) => v.file));
      // Backfill missing DB posters from local files so no card ever
      // renders a black/blank video thumbnail.
      const withPosters = (data as DemoVideo[]).map((v) => ({
        ...v,
        poster: v.poster || resolveLocalPoster(v.file),
      }));
      return [...withPosters, ...getLocalVideos(dbFiles)];
    }
  }
  // Fallback: local public/videos files (DB empty or unreachable).
  return getLocalVideos();
}

/**
 * Resolve a local poster image for a /videos/<file>.mp4 path.
 * Prefers <base>-poster.png, falls back to <base>.png, else null.
 */
function resolveLocalPoster(file: string): string | null {
  try {
    const dir = join(process.cwd(), "public", "videos");
    const base = file.replace(/^\/videos\//, "").replace(/\.mp4$/, "");
    const posterPosterPng = base + "-poster.png";
    const posterPng = base + ".png";
    const posterFile = existsSync(join(dir, posterPosterPng))
      ? posterPosterPng
      : posterPng;
    return existsSync(join(dir, posterFile)) ? `/videos/${posterFile}` : null;
  } catch {
    return null;
  }
}

/**
 * Safe fallback — builds video list from local public/videos/*.mp4 files.
 * Never throws; returns [] if directory is missing.
 */
function getLocalVideos(exclude: Set<string> = new Set()): DemoVideo[] {
  try {
    const dir = join(process.cwd(), "public", "videos");
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".mp4") && !exclude.has(`/videos/${f}`))
      .sort();
    return files.map((file, i) => {
      const base = file.replace(/\.mp4$/, "");
      // demo-boutique-whatsapp → niche: boutique, channel: whatsapp
      const parts = base.replace(/^demo-/, "").split("-");
      const channel = parts[parts.length - 1] || "website";
      const niche = parts.slice(0, -1).join(" ") || base;
      const poster = resolveLocalPoster(`/videos/${file}`);
      // Full SEO metadata for videos published without a DB row yet.
      const seo = videoSeoMeta[`/videos/${file}`];
      if (seo) {
        return {
          id: `local-${i}`,
          file: `/videos/${file}`,
          poster,
          niche: seo.niche,
          channel: seo.channel,
          title: seo.title,
          description: seo.description,
        };
      }
      return {
        id: `local-${i}`,
        file: `/videos/${file}`,
        poster,
        niche: niche.charAt(0).toUpperCase() + niche.slice(1),
        channel: channel.charAt(0).toUpperCase() + channel.slice(1),
        title: `${niche.charAt(0).toUpperCase() + niche.slice(1)} — ${channel} AI demo`,
        description: `Watch a ReplyPilot AI agent handle ${niche} enquiries over ${channel}.`,
      };
    });
  } catch {
    return [];
  }
}
