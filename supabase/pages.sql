-- ReplyPilot pages CMS — editable static pages (about, faq, contact, legal).
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pages_select_published" ON pages;
CREATE POLICY "pages_select_published"
  ON pages FOR SELECT TO public
  USING (published = TRUE);

DROP POLICY IF EXISTS "pages_admin_all" ON pages;
CREATE POLICY "pages_admin_all"
  ON pages FOR ALL TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
