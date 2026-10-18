-- ReplyPilot videos CMS — videos table.
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file TEXT NOT NULL,
  poster TEXT,
  niche TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_select_published" ON videos;
CREATE POLICY "videos_select_published"
  ON videos FOR SELECT TO public
  USING (published = TRUE);

DROP POLICY IF EXISTS "videos_admin_all" ON videos;
CREATE POLICY "videos_admin_all"
  ON videos FOR ALL TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS videos_published_idx ON videos (published, sort_order);

DROP TRIGGER IF EXISTS videos_updated_at ON videos;
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
