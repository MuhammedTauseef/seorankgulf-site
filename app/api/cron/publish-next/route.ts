import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { getAdminCookieHeader } from "@/lib/admin-session";
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

    // Publish path — everything goes through the admin API.
    const publishViaAdmin = async (
      article: QueuedArticle
    ): Promise<AdminPublishResult> => {
      const session = await getAdminCookieHeader();
      if (!session) {
        return {
          ok: false,
          httpStatus: 0,
          postId: null,
          slug: null,
          duplicateSlug: false,
          error: "admin_session_failed",
        };
      }
      const res = await fetch(`${req.nextUrl.origin}/api/admin/blog`, {
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
      let json: { post?: { id?: string; slug?: string }; error?: string } = {};
      try {
        json = await res.json();
      } catch {
        // Non-JSON response — status below still describes the failure.
      }
      const errorText = typeof json.error === "string" ? json.error : null;
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
