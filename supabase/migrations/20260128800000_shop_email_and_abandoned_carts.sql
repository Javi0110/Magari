-- Newsletter signups + abandoned carts for Shop Magari
-- Ejecuta en Supabase: SQL Editor → New query → Pegar → Run

create table if not exists public.shop_newsletter_signups (
  id bigint generated always as identity primary key,
  email text not null,
  source text default 'shop' not null,
  created_at timestamptz default now() not null
);

create table if not exists public.abandoned_carts (
  id bigint generated always as identity primary key,
  email text not null,
  cart jsonb not null,
  created_at timestamptz default now() not null,
  recovered boolean not null default false
);

alter table public.shop_newsletter_signups enable row level security;
alter table public.abandoned_carts enable row level security;

drop policy if exists "Allow all shop_newsletter_signups" on public.shop_newsletter_signups;
create policy "Allow all shop_newsletter_signups" on public.shop_newsletter_signups
  for all using (true) with check (true);

drop policy if exists "Allow all abandoned_carts" on public.abandoned_carts;
create policy "Allow all abandoned_carts" on public.abandoned_carts
  for all using (true) with check (true);

