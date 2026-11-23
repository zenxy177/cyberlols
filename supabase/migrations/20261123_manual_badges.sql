-- ==============================================================================
-- Migration: 20261123_manual_badges.sql
-- Description: Creates manual_badges table, extends profiles with disabled_discord_badges,
--              sets up updated_at trigger, and configures strict RLS policies.
-- ==============================================================================

-- 1. Create public.manual_badges table
create table if not exists public.manual_badges (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9_-]+$' and char_length(key) between 2 and 50),
  label text not null check (char_length(trim(label)) > 0 and char_length(label) <= 100),
  description text not null default '' check (char_length(description) <= 300),
  icon_url text not null default '' check (char_length(icon_url) <= 1000),
  sort integer not null default 0 check (sort between -9999 and 9999),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast ordering of badges
create index if not exists idx_manual_badges_sort on public.manual_badges (sort asc, created_at asc);

-- 2. Extend profiles table with disabled_discord_badges column
alter table public.profiles
  add column if not exists disabled_discord_badges text[] not null default '{}'::text[];

-- 3. Automatic updated_at trigger
drop trigger if exists set_manual_badges_updated_at on public.manual_badges;
create trigger set_manual_badges_updated_at
  before update on public.manual_badges
  for each row execute function public.set_profile_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.manual_badges enable row level security;

-- Grant table privileges
grant select on public.manual_badges to anon, authenticated;
grant insert, update, delete on public.manual_badges to authenticated;

-- Policies:
-- A. SELECT: Public / anon can view active enabled badges; site admins can view all (including disabled)
drop policy if exists "Public can view enabled manual badges" on public.manual_badges;
create policy "Public can view enabled manual badges"
  on public.manual_badges
  for select
  to anon, authenticated
  using (enabled = true or (select public.is_site_admin()));

-- B. INSERT: Only site admin can create manual badges
drop policy if exists "Only site admin can insert manual badges" on public.manual_badges;
create policy "Only site admin can insert manual badges"
  on public.manual_badges
  for insert
  to authenticated
  with check ((select public.is_site_admin()));

-- C. UPDATE: Only site admin can update manual badges
drop policy if exists "Only site admin can update manual badges" on public.manual_badges;
create policy "Only site admin can update manual badges"
  on public.manual_badges
  for update
  to authenticated
  using ((select public.is_site_admin()))
  with check ((select public.is_site_admin()));

-- D. DELETE: Only site admin can delete manual badges
drop policy if exists "Only site admin can delete manual badges" on public.manual_badges;
create policy "Only site admin can delete manual badges"
  on public.manual_badges
  for delete
  to authenticated
  using ((select public.is_site_admin()));
