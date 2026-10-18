/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Good enough as a first line of defence for low-traffic forms/APIs
 * (slows down bots and abuse). On serverless platforms each instance
 * keeps its own counters — for heavier needs use a shared store
 * (e.g. Upstash Redis), the call sites are already isolated for that.
 */

const hits = new Map<string, number[]>();
const MAX_KEYS = 5000;

function prune(now: number, windowMs: number) {
  if (hits.size <= MAX_KEYS) return;
  for (const [key, times] of hits) {
    if (times.length === 0 || now - times[times.length - 1] > windowMs) {
      hits.delete(key);
    }
    if (hits.size <= MAX_KEYS) break;
  }
}

/** Returns true when the request is allowed, false when rate-limited. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const times = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (times.length >= limit) {
    hits.set(key, times);
    return false;
  }
  times.push(now);
  hits.set(key, times);
  prune(now, windowMs);
  return true;
}

/** Best-effort client IP (works behind Vercel / proxies).
 *
 * Trust model (verified):
 * - On Vercel, x-real-ip is set by Vercel's edge to the actual connecting
 *   address — the edge sanitizes/overwrites any client-sent value, so it
 *   cannot be spoofed THROUGH Vercel.
 * - x-forwarded-for's FIRST entry CAN be spoofed (client sends their own
 *   header, Vercel appends the real IP after it). Never trust position [0]
 *   for security decisions.
 * - Off Vercel (local dev, other hosts), x-real-ip may be client-controlled.
 *   Treat IP-based limits as best-effort everywhere; use userKey() for
 *   authenticated routes where bypass-resistance matters.
 */
export function clientIp(req: Request): string {
  // x-real-ip is set by Vercel's edge — client cannot spoof it.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && /^\d{1,3}(\.\d{1,3}){3}$/.test(realIp)) return realIp;
  if (realIp && /^[0-9a-fA-F:]+$/.test(realIp)) return realIp;

  // Fall back to x-forwarded-for, but only accept valid IP formats.
  // NOTE: the first entry can be spoofed by a malicious client sending
  // their own x-forwarded-for header — treat IP limits as best-effort.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(first)) return first;
    if (/^[0-9a-fA-F:]+$/.test(first)) return `fwd:${first}`;
    return "invalid-ip";
  }
  return "unknown";
}

/**
 * Rate limit keyed by authenticated user ID — cannot be bypassed by IP
 * rotation. Use this on all authenticated routes instead of clientIp().
 */
export function userKey(prefix: string, userId: string): string {
  return `${prefix}:user:${userId}`;
}
