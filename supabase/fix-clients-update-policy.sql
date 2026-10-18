-- P0 SECURITY FIX: clients UPDATE policy was missing WITH CHECK
-- Without this, a logged-in client could set their own subscription_status='active'
-- without paying. Run this in Supabase Dashboard → SQL Editor.
--
-- Date: 2026-10-08

DROP POLICY IF EXISTS clients_update_own ON clients;

CREATE POLICY clients_update_own ON clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
