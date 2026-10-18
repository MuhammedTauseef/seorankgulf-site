-- ReplyPilot — allow logged-in clients to read bookings made with their own business.
-- Bookings are linked to a client via bookings.source = clients.business_name
-- (set by /api/client-booking). Admins keep full access via bookings_select_admin.
-- Safe to re-run.

drop policy if exists "bookings_select_own_business" on public.bookings;
create policy "bookings_select_own_business"
  on public.bookings for select to authenticated
  using (
    source in (
      select business_name from public.clients where user_id = auth.uid()
    )
  );
