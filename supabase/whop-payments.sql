-- ============================================================
-- ReplyPilot — Whop Payment Verification (zero-compromise)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Extend payments table with Whop fields
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS whop_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS whop_event_id TEXT,
  ADD COLUMN IF NOT EXISTS buyer_email TEXT,
  ADD COLUMN IF NOT EXISTS buyer_name TEXT,
  ADD COLUMN IF NOT EXISTS plan_key TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Unique constraint on Whop payment ID (idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_whop_payment_id_unique'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_whop_payment_id_unique UNIQUE (whop_payment_id);
  END IF;
END $$;

-- 2. Extend subscriptions table with Whop fields
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS whop_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS whop_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS buyer_email TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_whop_subscription_id_unique'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_whop_subscription_id_unique UNIQUE (whop_subscription_id);
  END IF;
END $$;

-- 3. Webhook events audit log (idempotency + forensics)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'whop',
  webhook_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  error TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, webhook_id)
);

-- 4. RLS for webhook_events (admin only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_events_admin_all" ON webhook_events;
CREATE POLICY "webhook_events_admin_all" ON webhook_events
  FOR ALL TO authenticated
  USING (public.is_admin());

-- 5. RLS for payments (admin sees all, client sees own)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_admin_all" ON payments;
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "payments_client_own" ON payments;
CREATE POLICY "payments_client_own" ON payments
  FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- 6. Helpful indexes
CREATE INDEX IF NOT EXISTS payments_buyer_email_idx ON payments (buyer_email);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);
CREATE INDEX IF NOT EXISTS webhook_events_type_idx ON webhook_events (event_type);
