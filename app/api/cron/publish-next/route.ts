import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { mintAdminSession } from "@/lib/admin-session";
import {
  createSupabaseQueueStore,
  publishNextQueuedArticle,
  type AdminPublishResult,
  type QueuedArticle,
} from "@/lib/buffer-publisher";

// Vercel Cron: daily 03:00 UTC (08:00 PKT). Publishes at most ONE due
// queued article, through the admin publish API (POST /api/admin/blog)
// with a real admin session — the same action the /admin panel uses.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isSchemaMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /blog_buffer_queue|blog_publish_runs/.test(msg);
}

const SCHEMA_ERROR =
  "Buffer schema not applied yet — run supabase/blog-buffer-publisher.sql in the Supabase SQL Editor for project seorankgulf, then redeploy.";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "CRON_SECRET is not configured on this project. Add it in Vercel → Settings → Environment Variables (Production), then redeploy.",
      },
      { status: 503 }
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 503 }
    );
  }
  const store = createSupabaseQueueStore(supabase);
  const deployHookConfigured = Boolean(process.env.VERCEL_DEPLOY_HOOK_URL);
  const statusMode = req.nextUrl.searchParams.get("status") === "1";

  try {
    if (statusMode) {
      const [counts, next, lastRun] = await Promise.all([
        store.countByStatus(),
        store.nextQueued(),
        store.lastRun(),
      ]);
      return NextResponse.json({
        ok: true,
        queue: counts,
        next: next
          ? { slug: next.slug, title: next.title, publish_at: next.publish_at }
          : null,
        last_run: lastRun,
        config: {
          cron_secret_configured: true,
          service_role_configured: true,
          deploy_hook_configured: deployHookConfigured,
          admin_email:
            process.env.BUFFER_ADMIN_EMAIL || "tauseefrock456@gmail.com",
        },
      });
    }

    // Health probe — exercises the admin-session mint + a READ-ONLY
    // admin API call (GET /api/admin/blog) without touching the queue
    // or publishing anything. Exists so the session path that failed
    // silently on 2026-10-28 (bare "HTTP 401" in the run log) can be
    // checked on demand and after deploys.
    if (req.nextUrl.searchParams.get("probe") === "1") {
      const session = await mintAdminSession();
      if (!session.ok) {
        return NextResponse.json({
          ok: false,
          probe: true,
          session_step_failed: session.step,
          error: session.error,
        });
      }
      try {
        const res = await fetch(`${req.nextUrl.origin}/api/admin/blog`, {
          method: "GET",
          headers: { cookie: session.cookieHeader },
        });
        let adminError: string | null = null;
        try {
          const json = (await res.json()) as { error?: unknown };
          adminError = typeof json.error === "string" ? json.error : null;
        } catch {
          adminError = "non-JSON response body";
        }
        return NextResponse.json({
          ok: res.ok,
          probe: true,
          admin_email: session.email,
          admin_get_status: res.status,
          admin_get_error: res.ok ? null : adminError,
        });
      } catch (err) {
        return NextResponse.json({
          ok: false,
          probe: true,
          admin_email: session.email,
          error: `Admin API fetch failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      }
    }

    // Publish path — everything goes through the admin API.
    const publishViaAdmin = async (
      article: QueuedArticle
    ): Promise<AdminPublishResult> => {
      const session = await mintAdminSession();
      if (!session.ok) {
        return {
          ok: false,
          httpStatus: 0,
          postId: null,
          slug: null,
          duplicateSlug: false,
          sessionFailed: true,
          error: "admin_session_failed",
          detail: `Admin session minting failed at step "${session.step}": ${session.error}`,
        };
      }
      let res: Response;
      try {
        res = await fetch(`${req.nextUrl.origin}/api/admin/blog`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: session.cookieHeader,
          },
          body: JSON.stringify({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            keywords: article.keywords,
            cover_image: article.cover_image ?? undefined,
            published: true,
          }),
        });
      } catch (err) {
        // Network-level failure (no response at all). Report it as a
        // result instead of throwing — a throw would strand the queue
        // row in 'publishing' with no run log.
        return {
          ok: false,
          httpStatus: 0,
          postId: null,
          slug: null,
          duplicateSlug: false,
          error: "admin_fetch_failed",
          detail: `Admin API fetch failed before any response: ${
            err instanceof Error ? err.message : String(err)
          }`,
        };
      }
      const rawBody = await res.text().catch(() => "");
      let json: { post?: { id?: string; slug?: string }; error?: string } = {};
      try {
        json = JSON.parse(rawBody) as typeof json;
      } catch {
        // Non-JSON response — diagnostics below describe what came back.
      }
      const errorText = typeof json.error === "string" ? json.error : null;
      // When the admin route's own JSON error is absent, the response
      // did not come from the admin route's auth check (which always
      // returns {"error": ...}). Record what it actually was — status,
      // content type, routing headers, body excerpt — so the run log
      // identifies the responding layer instead of a bare "HTTP 401".
      const detail =
        !res.ok && !errorText
          ? `HTTP ${res.status} without the admin route's JSON error (content-type: ${res.headers.get("content-type") ?? "unknown"}; x-matched-path: ${res.headers.get("x-matched-path") ?? "unknown"}; x-vercel-id: ${res.headers.get("x-vercel-id") ?? "unknown"}; body starts: "${rawBody.slice(0, 120).replace(/\s+/g, " ")}")`
          : null;
      return {
        ok: res.ok,
        httpStatus: res.status,
        postId: json.post?.id ?? null,
        slug: json.post?.slug ?? null,
        duplicateSlug:
          res.status === 400 &&
          !!errorText &&
          /already exists/i.test(errorText),
        error: res.ok ? null : (errorText ?? `HTTP ${res.status}`),
        detail,
      };
    };

    const liveCheck = async (slug: string): Promise<boolean> => {
      const url = `${req.nextUrl.origin}/blog/${slug}`;
      const deadline = Date.now() + 40_000;
      while (Date.now() < deadline) {
        try {
          const res = await fetch(url, { method: "GET", redirect: "follow" });
          if (res.status === 200) return true;
        } catch {
          // Not reachable yet — keep polling until the deadline.
        }
        await new Promise((r) => setTimeout(r, 5_000));
      }
      return false;
    };

    const result = await publishNextQueuedArticle(
      store,
      publishViaAdmin,
      liveCheck,
      deployHookConfigured
    );

    if (result.outcome === "admin_session_failed") {
      return NextResponse.json(
        {
          error:
            "Could not establish an admin session server-side (service-role session minting failed). Nothing was published.",
          outcome: result.outcome,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      outcome: result.outcome,
      slug: result.article?.slug ?? null,
      admin_http_status: result.admin?.httpStatus ?? null,
      live_verified: result.liveVerified,
      deploy_hook_configured: deployHookConfigured,
      run_logged: result.runLogged,
      ...(result.runLogged
        ? {}
        : { run_log: "unavailable — blog_publish_runs insert failed" }),
    });
  } catch (err) {
    if (isSchemaMissing(err)) {
      return NextResponse.json({ error: SCHEMA_ERROR }, { status: 503 });
    }
    return NextResponse.json(
      {
        error: `Publisher failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 }
    );
  }
}
