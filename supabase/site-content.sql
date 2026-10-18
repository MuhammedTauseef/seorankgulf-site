-- SEORankGulf site content CMS — homepage content stored as JSON in site_settings.
-- Run in Supabase SQL Editor. Safe to re-run (uses ON CONFLICT DO NOTHING).
--
-- The /admin/content editor reads/writes the `homepage_content` key.
-- `whatsapp_number` holds the real business WhatsApp number (digits only).

-- whatsapp_number key (admin replaces the placeholder via /admin/content)
INSERT INTO site_settings (key, value, label) VALUES
  ('whatsapp_number', '971500000000', 'WhatsApp number for all CTA buttons (digits only, e.g. 971501234567). REPLACE with the real business number.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, label) VALUES
  ('whatsapp_display', '+971-50-000-0000', 'WhatsApp number as shown in the footer (e.g. +971-50-123-4567).')
ON CONFLICT (key) DO NOTHING;

-- homepage_content key: seeded empty so the site uses built-in defaults until
-- the admin saves via /admin/content (which writes the full JSON here).
INSERT INTO site_settings (key, value, label) VALUES
  ('homepage_content', '', 'Homepage content JSON (managed by /admin/content — do not edit by hand).')
ON CONFLICT (key) DO NOTHING;
