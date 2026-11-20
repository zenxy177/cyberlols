create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.site_admins enable row level security;
revoke all on public.site_admins from anon, authenticated;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.site_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.profiles (
  id text primary key default 'main' check (id = 'main'),
  display_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  location text not null default '',
  avatar_url text,
  background_url text,
  background_video_url text,
  background_video_opacity integer not null default 70 check (background_video_opacity >= 0 and background_video_opacity <= 100),
  background_video_audio_fallback text not null default 'video',
  card_opacity integer not null default 75 check (card_opacity >= 10 and card_opacity <= 100),
  entrance_effect_preset text not null default 'signal_sweep',
  audio_url text,
  audio_title text not null default 'Arka Plan Müziği',
  audio_artist text not null default '',
  default_volume integer not null default 50 check (default_volume >= 0 and default_volume <= 100),
  click_to_enter_text text not null default 'click to enter',
  typewriter_lines text[] not null default array['Welcome to my profile.', 'Moon Knight aesthetic.'],
  enable_custom_cursor boolean not null default true,
  enable_tilt boolean not null default true,
  views_count bigint not null default 0,
  discord_user_id text,
  discord_username text,
  discord_global_name text,
  discord_avatar_url text,
  discord_presence_width integer not null default 100 check (discord_presence_width between 70 and 100),
  discord_presence_padding integer not null default 12 check (discord_presence_padding between 4 and 24),
  discord_presence_avatar_size integer not null default 72 check (discord_presence_avatar_size between 36 and 80),
  discord_presence_art_size integer not null default 68 check (discord_presence_art_size between 36 and 80),
  discord_presence_text_scale integer not null default 100 check (discord_presence_text_scale between 80 and 120),
  discord_badges text[] not null default '{}',
  discord_badges_mode text not null default 'auto',
  accent_color text not null default '#78a7ff'
    check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  surface_color text not null default '#11131a'
    check (surface_color ~ '^#[0-9A-Fa-f]{6}$'),
  links jsonb not null default '[]'::jsonb
    check (jsonb_typeof(links) = 'array'),
  links_layout text not null default 'dock',
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.profiles
  alter column accent_color set default '#78a7ff',
  alter column surface_color set default '#11131a';

alter table public.profiles
  add column if not exists background_video_url text,
  add column if not exists background_video_opacity integer not null default 70,
  add column if not exists background_video_audio_fallback text not null default 'video',
  add column if not exists card_opacity integer not null default 75,
  add column if not exists entrance_effect_preset text not null default 'signal_sweep',
  add column if not exists audio_url text,
  add column if not exists audio_title text not null default 'Arka Plan Müziği',
  add column if not exists audio_artist text not null default '',
  add column if not exists default_volume integer not null default 50,
  add column if not exists click_to_enter_text text not null default 'click to enter',
  add column if not exists typewriter_lines text[] not null default array['Welcome to my profile.', 'Moon Knight aesthetic.']::text[],
  add column if not exists enable_custom_cursor boolean not null default true,
  add column if not exists enable_tilt boolean not null default true,
  add column if not exists enable_moon_badge boolean not null default true,
  add column if not exists moon_badge_title text not null default 'Moon Knight',
  add column if not exists enable_lunar_effects boolean not null default true,
  add column if not exists card_border_effect text not null default 'lunar_aurora',
  add column if not exists name_effect text not null default 'lunar_shimmer',
  add column if not exists cursor_style text not null default 'neon_dot',
  add column if not exists cursor_trail text not null default 'stardust',
  add column if not exists enable_click_ripple boolean not null default true,
  add column if not exists views_count bigint not null default 0,
  add column if not exists discord_user_id text,
  add column if not exists discord_username text,
  add column if not exists discord_global_name text,
  add column if not exists discord_avatar_url text,
  add column if not exists discord_presence_width integer not null default 100 check (discord_presence_width between 70 and 100),
  add column if not exists discord_presence_padding integer not null default 12 check (discord_presence_padding between 4 and 24),
  add column if not exists discord_presence_avatar_size integer not null default 72 check (discord_presence_avatar_size between 36 and 80),
  add column if not exists discord_presence_art_size integer not null default 68 check (discord_presence_art_size between 36 and 80),
  add column if not exists discord_presence_text_scale integer not null default 100 check (discord_presence_text_scale between 80 and 120),
  add column if not exists discord_badges text[] not null default '{}',
  add column if not exists discord_badges_mode text not null default 'auto',
  add column if not exists links_layout text not null default 'dock';

alter table public.profiles enable row level security;
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;

drop policy if exists "Anyone can view published profile" on public.profiles;
create policy "Anyone can view published profile"
  on public.profiles
  for select
  to anon, authenticated
  using (is_published or (select public.is_site_admin()));

drop policy if exists "Only owner can add profile" on public.profiles;
create policy "Only owner can add profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select public.is_site_admin()));

drop policy if exists "Only owner can edit profile" on public.profiles;
create policy "Only owner can edit profile"
  on public.profiles
  for update
  to authenticated
  using ((select public.is_site_admin()))
  with check ((select public.is_site_admin()));

drop policy if exists "Only owner can remove profile" on public.profiles;
create policy "Only owner can remove profile"
  on public.profiles
  for delete
  to authenticated
  using ((select public.is_site_admin()));

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profile_updated_at on public.profiles;
create trigger set_profile_updated_at
  before update on public.profiles
  for each row execute function public.set_profile_updated_at();

create or replace function public.increment_profile_views(profile_slug text default 'main')
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_count bigint;
begin
  update public.profiles
  set views_count = coalesce(views_count, 0) + 1
  where id = profile_slug
  returning views_count into new_count;

  -- Profil kaydı yoksa boş bir profil oluşturma; sayaç 0 döner.
  return coalesce(new_count, 0);
end;
$$;

revoke all on function public.increment_profile_views(text) from public;
grant execute on function public.increment_profile_views(text) to anon, authenticated;

create or replace function public.set_profile_views(new_count bigint, profile_slug text default 'main')
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_site_admin()) then
    raise exception 'Unauthorized: Only site admin can set profile views';
  end if;

  update public.profiles
  set views_count = greatest(0, new_count)
  where id = profile_slug;
  return greatest(0, new_count);
end;
$$;

revoke all on function public.set_profile_views(bigint, text) from public;
grant execute on function public.set_profile_views(bigint, text) to authenticated;


insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public profile media is readable" on storage.objects;
create policy "Public profile media is readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'profile-media');

drop policy if exists "Only owner can upload profile media" on storage.objects;
create policy "Only owner can upload profile media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-media'
    and (select public.is_site_admin())
  );

drop policy if exists "Only owner can update profile media" on storage.objects;
create policy "Only owner can update profile media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (select public.is_site_admin())
  )
  with check (
    bucket_id = 'profile-media'
    and (select public.is_site_admin())
  );

drop policy if exists "Only owner can delete profile media" on storage.objects;
create policy "Only owner can delete profile media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (select public.is_site_admin())
  );


-- ==============================================================================
-- 100% REAL VISITOR ANALYTICS LOG (Cyber Studio Dashboard)
-- ==============================================================================
create table if not exists public.profile_views_log (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'main',
  viewed_at timestamptz not null default now(),
  device_type text not null default 'desktop',
  browser text not null default 'Chrome',
  country_code text not null default 'TR',
  country_name text not null default 'Türkiye',
  referrer text not null default 'Doğrudan (Direct / URL)',
  ip_hash text
);

alter table public.profile_views_log
  add column if not exists ip_hash text;

create index if not exists idx_profile_views_log_viewed_at on public.profile_views_log (viewed_at desc);
create index if not exists idx_profile_views_log_profile_id on public.profile_views_log (profile_id);
create index if not exists idx_profile_views_log_ip_hash on public.profile_views_log (ip_hash, viewed_at desc);

alter table public.profile_views_log enable row level security;
grant insert on public.profile_views_log to anon, authenticated;
grant select, delete on public.profile_views_log to authenticated;

drop policy if exists "Anyone can record a view log" on public.profile_views_log;
create policy "Anyone can record a view log"
  on public.profile_views_log
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can view all logs" on public.profile_views_log;
create policy "Admins can view all logs"
  on public.profile_views_log
  for select
  to authenticated
  using ((select public.is_site_admin()));

drop policy if exists "Admins can delete logs" on public.profile_views_log;
create policy "Admins can delete logs"
  on public.profile_views_log
  for delete
  to authenticated
  using ((select public.is_site_admin()));

create or replace function public.record_profile_view(
  profile_slug text default 'main',
  device_type text default 'desktop',
  browser_name text default 'Chrome',
  visitor_country text default 'TR',
  country_label text default 'Türkiye',
  referrer_source text default 'Doğrudan (Direct / URL)',
  visitor_ip_hash text default null
)
returns table (current_views_count bigint, visit_recorded boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  already_seen boolean := false;
  counted_views bigint;
begin
  if visitor_ip_hash is not null then
    perform pg_advisory_xact_lock(hashtext('profile_view'), hashtext(visitor_ip_hash));

    select exists (
      select 1
      from public.profile_views_log
      where profile_id = profile_slug
        and ip_hash = visitor_ip_hash
        and viewed_at >= now() - interval '24 hours'
    ) into already_seen;
  end if;

  if already_seen then
    select coalesce(p.views_count, 0) into counted_views
    from public.profiles p
    where p.id = profile_slug;

    return query select coalesce(counted_views, 0), false;
    return;
  end if;

  insert into public.profile_views_log (
    profile_id, device_type, browser, country_code, country_name, referrer, ip_hash
  ) values (
    profile_slug, device_type, browser_name, visitor_country, country_label, referrer_source, visitor_ip_hash
  );

  update public.profiles
  set views_count = coalesce(profiles.views_count, 0) + 1
  where profiles.id = profile_slug
  returning profiles.views_count into counted_views;

  return query select coalesce(counted_views, 0), true;
end;
$$;

grant execute on function public.record_profile_view(text, text, text, text, text, text, text) to anon, authenticated;
