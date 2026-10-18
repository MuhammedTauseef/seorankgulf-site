-- ============================================================
-- ReplyPilot Phase 2 — Database Migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Enable pgvector for knowledge base semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Clients table (extends profiles with business info)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT,
  whatsapp_number TEXT,
  website TEXT,
  business_description TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  agent_config JSONB DEFAULT '{}'::jsonb,
  agent_status TEXT DEFAULT 'draft' CHECK (agent_status IN ('draft', 'preview', 'building', 'ready', 'live')),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trial', 'active', 'past_due', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('build', 'care')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payments ledger
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  type TEXT NOT NULL CHECK (type IN ('upfront', 'go_live', 'monthly', 'refund')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Knowledge base documents (with vector embeddings)
CREATE TABLE IF NOT EXISTS kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS kb_documents_embedding_idx
  ON kb_documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 6. Email log
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ
);

-- 7. Extend bookings with calendar fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed'
  CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show'));

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Clients: users see only their own; admins see all
CREATE POLICY clients_select_own ON clients FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY clients_insert_own ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY clients_update_own ON clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY clients_admin_all ON clients FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Subscriptions: read-only for owners
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = subscriptions.client_id AND clients.user_id = auth.uid()));
CREATE POLICY subscriptions_admin_all ON subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Payments: read-only for owners
CREATE POLICY payments_select_own ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.user_id = auth.uid()));
CREATE POLICY payments_admin_all ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- KB documents: owners manage their own
CREATE POLICY kb_select_own ON kb_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = kb_documents.client_id AND clients.user_id = auth.uid()));
CREATE POLICY kb_insert_own ON kb_documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = kb_documents.client_id AND clients.user_id = auth.uid()));
CREATE POLICY kb_delete_own ON kb_documents FOR DELETE
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = kb_documents.client_id AND clients.user_id = auth.uid()));
CREATE POLICY kb_admin_all ON kb_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Email log: admin only
CREATE POLICY email_log_admin ON email_log FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Updated-at trigger for clients
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Done! Verify with:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public'
--   AND tablename IN ('clients','subscriptions','payments','kb_documents','email_log');
-- ============================================================
