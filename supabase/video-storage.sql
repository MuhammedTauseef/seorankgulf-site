-- ============================================================
-- ReplyPilot — Video Upload Storage (Supabase Storage)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create public bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Public read access (anyone can view videos)
DROP POLICY IF EXISTS "videos_public_read" ON storage.objects;
CREATE POLICY "videos_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'videos');

-- 3. Admin upload (authenticated admins can upload)
DROP POLICY IF EXISTS "videos_admin_insert" ON storage.objects;
CREATE POLICY "videos_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND public.is_admin());

-- 4. Admin update/delete
DROP POLICY IF EXISTS "videos_admin_update" ON storage.objects;
CREATE POLICY "videos_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND public.is_admin());

DROP POLICY IF EXISTS "videos_admin_delete" ON storage.objects;
CREATE POLICY "videos_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND public.is_admin());
