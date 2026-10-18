-- ReplyPilot Phase 3 — AI features: real KB embeddings, chat transcripts, indexes.
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).

-- ============================================================
-- 1. KB embeddings: Gemini text-embedding-004 outputs 768 dims
--    (the old vector(1536) was OpenAI's size and never populated).
-- ============================================================
DROP INDEX IF EXISTS kb_documents_embedding_idx;
ALTER TABLE kb_documents ALTER COLUMN embedding TYPE vector(768);
CREATE INDEX IF NOT EXISTS kb_documents_embedding_idx
  ON kb_documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Semantic search function: top matching chunks for a client.
CREATE OR REPLACE FUNCTION match_kb_documents(
  query_embedding vector(768),
  match_client_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  filename text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb_documents.id,
    kb_documents.filename,
    kb_documents.content,
    1 - (kb_documents.embedding <=> query_embedding) AS similarity
  FROM kb_documents
  WHERE kb_documents.client_id = match_client_id
    AND kb_documents.embedding IS NOT NULL
  ORDER BY kb_documents.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- 2. Chat transcripts — every website chat saved for review.
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_name TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_transcripts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_transcripts_select_own" ON chat_transcripts;
CREATE POLICY "chat_transcripts_select_own"
  ON chat_transcripts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_transcripts_insert_own" ON chat_transcripts;
CREATE POLICY "chat_transcripts_insert_own"
  ON chat_transcripts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_transcripts_admin_all" ON chat_transcripts;
CREATE POLICY "chat_transcripts_admin_all"
  ON chat_transcripts FOR ALL TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS chat_transcripts_user_id_idx
  ON chat_transcripts (user_id);
CREATE INDEX IF NOT EXISTS chat_transcripts_created_at_idx
  ON chat_transcripts (created_at DESC);

-- ============================================================
-- 3. Index for per-client booking lookups (dashboard stats).
-- ============================================================
CREATE INDEX IF NOT EXISTS bookings_source_idx ON bookings (source);
