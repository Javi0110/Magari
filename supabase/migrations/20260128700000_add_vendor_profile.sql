-- Perfil público de vendors para "Meet Our Makers"
-- Ejecuta en Supabase: SQL Editor → New query → Pegar → Run

alter table public.vendors
  add column if not exists profile_bio text default '',
  add column if not exists profile_location text default '',
  add column if not exists profile_website text default '',
  add column if not exists profile_instagram text default '',
  add column if not exists profile_avatar_url text default '',
  add column if not exists profile_banner_url text default '',
  add column if not exists published boolean not null default false;

