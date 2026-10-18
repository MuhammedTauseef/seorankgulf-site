-- ReplyPilot demos CMS — demos table.
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT 'website' CHECK (group_name IN ('website', 'whatsapp', 'instagram')),
  business TEXT NOT NULL DEFAULT '',
  blurb TEXT NOT NULL DEFAULT '',
  welcome TEXT NOT NULL DEFAULT '',
  published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demos_select_published" ON demos;
CREATE POLICY "demos_select_published"
  ON demos FOR SELECT TO public
  USING (published = TRUE);

DROP POLICY IF EXISTS "demos_admin_all" ON demos;
CREATE POLICY "demos_admin_all"
  ON demos FOR ALL TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS demos_slug_idx ON demos (slug);
CREATE INDEX IF NOT EXISTS demos_published_idx ON demos (published, sort_order);

DROP TRIGGER IF EXISTS demos_updated_at ON demos;
CREATE TRIGGER demos_updated_at
  BEFORE UPDATE ON demos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
