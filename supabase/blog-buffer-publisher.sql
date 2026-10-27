-- SEORankGulf article buffer + auto-publisher — queue & run-log tables.
-- Run in Supabase SQL Editor (project: seorankgulf). Safe to re-run.
--
-- NOTE: schema.sql + phase2-migration.sql must have run first (they define
-- public.is_admin()). blog_posts is NOT altered by this file — a queued
-- article does not exist in blog_posts until the admin publish action
-- (POST /api/admin/blog) creates it.
--
-- blog_buffer_queue: finished articles waiting for their publish date.
-- blog_publish_runs: one row per auto-publisher run (audit log).

CREATE TABLE IF NOT EXISTS blog_buffer_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords TEXT[] DEFAULT '{}',
  cover_image TEXT,
  publish_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'publishing', 'published', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  published_post_id UUID,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_buffer_queue_due_idx
  ON blog_buffer_queue (status, publish_at, created_at);

ALTER TABLE blog_buffer_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_buffer_queue_admin_all" ON blog_buffer_queue;
CREATE POLICY "blog_buffer_queue_admin_all"
  ON blog_buffer_queue FOR ALL TO authenticated
  USING (public.is_admin());

CREATE TABLE IF NOT EXISTS blog_publish_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  outcome TEXT NOT NULL,
  queue_id UUID,
  slug TEXT,
  deploy_hook_configured BOOLEAN,
  live_verified BOOLEAN,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS blog_publish_runs_recent_idx
  ON blog_publish_runs (run_at DESC);

ALTER TABLE blog_publish_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_publish_runs_admin_all" ON blog_publish_runs;
CREATE POLICY "blog_publish_runs_admin_all"
  ON blog_publish_runs FOR ALL TO authenticated
  USING (public.is_admin());
