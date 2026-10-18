-- ReplyPilot blog CMS — blog_posts table.
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords TEXT[] DEFAULT '{}',
  cover_image TEXT,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts.
DROP POLICY IF EXISTS "blog_posts_select_published" ON blog_posts;
CREATE POLICY "blog_posts_select_published"
  ON blog_posts FOR SELECT TO public
  USING (published = TRUE);

-- Admins manage everything.
DROP POLICY IF EXISTS "blog_posts_admin_all" ON blog_posts;
CREATE POLICY "blog_posts_admin_all"
  ON blog_posts FOR ALL TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published, created_at DESC);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
