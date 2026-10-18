-- ReplyPilot website database schema (Phase 1)
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Re-running is safe (all statements are idempotent).

-- ============================================================
-- 1. PROFILES — one row per auth user, holds the role.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

-- Auto-create a 'client' profile the moment someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin? (security definer → bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 2. LEADS — contact-form enquiries (+ client-attached enquiries).
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  business_type text,
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anyone (logged out OR logged in) may INSERT a lead via the form.
-- They cannot read, update or delete.
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
  on public.leads for insert to public
  with check (true);

-- Admins may read every lead.
drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin"
  on public.leads for select to authenticated
  using (public.is_admin());

-- Clients may read only their own leads (submitted while signed in).
drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select to authenticated
  using (auth.uid() = user_id);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_user_id_idx on public.leads (user_id);

-- Admins may delete leads (dashboard Delete button). Without this, deletes
-- silently affect 0 rows under RLS and the row "comes back" after reload.
drop policy if exists "leads_delete_admin" on public.leads;
create policy "leads_delete_admin"
  on public.leads for delete to authenticated
  using (public.is_admin());

-- Where the lead came from ('form' or 'chat'). Added after the fact; safe to re-run.
alter table public.leads add column if not exists source text;

-- ============================================================
-- 3. BOOKINGS — demo bookings made through the AI chat agent.
-- ============================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  source text not null default 'chat',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- Anyone (logged out OR logged in) may INSERT a booking via the chat agent.
-- They cannot read, update or delete.
drop policy if exists "bookings_insert_public" on public.bookings;
create policy "bookings_insert_public"
  on public.bookings for insert to public
  with check (true);

-- Admins may read every booking.
drop policy if exists "bookings_select_admin" on public.bookings;
create policy "bookings_select_admin"
  on public.bookings for select to authenticated
  using (public.is_admin());

create index if not exists bookings_slot_start_idx on public.bookings (slot_start);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- Admins may delete bookings (dashboard Delete button). Same RLS note as leads.
drop policy if exists "bookings_delete_admin" on public.bookings;
create policy "bookings_delete_admin"
  on public.bookings for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 4. MAKE YOURSELF ADMIN (run after you sign up, replace the email)
-- ============================================================
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
