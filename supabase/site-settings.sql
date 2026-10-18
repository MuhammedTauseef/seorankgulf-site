-- ReplyPilot site settings CMS — key-value settings table.
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON site_settings;
CREATE POLICY "site_settings_select_public"
  ON site_settings FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;
CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL TO authenticated
  USING (public.is_admin());

-- Default settings
INSERT INTO site_settings (key, value, label) VALUES
  ('announcement_bar', '', 'Announcement bar text (empty = hidden)'),
  ('hero_headline', 'AI agents that sell while you sleep.', 'Homepage hero headline'),
  ('hero_sub', 'ReplyPilot builds custom AI sales agents for small businesses — WhatsApp, Instagram, and website automation that books appointments and captures leads 24/7.', 'Homepage hero subtext'),
  ('contact_email', 'muhammadtauseef714@gmail.com', 'Contact email shown on site')
ON CONFLICT (key) DO NOTHING;

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faqs_select_published" ON faqs;
CREATE POLICY "faqs_select_published"
  ON faqs FOR SELECT TO public
  USING (published = TRUE);

DROP POLICY IF EXISTS "faqs_admin_all" ON faqs;
CREATE POLICY "faqs_admin_all"
  ON faqs FOR ALL TO authenticated
  USING (public.is_admin());

-- Seed default FAQs
INSERT INTO faqs (question, answer, published, sort_order)
SELECT 'Do I need technical skills?', 'No. I handle the build, setup, and testing, then show you the parts you need to know in plain language.', TRUE, 0
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do I need technical skills?');
INSERT INTO faqs (question, answer, published, sort_order)
SELECT 'What if customers prefer humans?', 'Human handoff is built in. The agent handles routine questions and passes the conversation to you or your team when a customer wants a person — or the situation needs judgment.', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What if customers prefer humans?');
INSERT INTO faqs (question, answer, published, sort_order)
SELECT 'What does the monthly care cover?', 'Hosting of the agent, updates, and support — that''s my service fee. Your AI API usage and WhatsApp Business messaging charges (if used) are separate and billed directly by those providers.', TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What does the monthly care cover?');
