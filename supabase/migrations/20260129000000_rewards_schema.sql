-- MAGARI REWARDS – CORE SCHEMA
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

create table if not exists public.rewards_users (
  id bigint generated always as identity primary key,
  email text not null unique,
  name text,
  points integer not null default 0,
  referral_code text not null unique,
  referred_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rewards_users enable row level security;

drop policy if exists "Allow public read rewards_users" on public.rewards_users;
create policy "Allow public read rewards_users"
  on public.rewards_users for select
  using (true);

drop policy if exists "Allow public insert rewards_users" on public.rewards_users;
create policy "Allow public insert rewards_users"
  on public.rewards_users for insert
  with check (true);

drop policy if exists "Allow public update rewards_users" on public.rewards_users;
create policy "Allow public update rewards_users"
  on public.rewards_users for update
  using (true)
  with check (true);

create table if not exists public.rewards_point_ledger (
  id bigint generated always as identity primary key,
  user_id bigint not null references public.rewards_users(id) on delete cascade,
  type text not null,
  points integer not null,
  order_id bigint references public.shop_orders(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.rewards_point_ledger enable row level security;

drop policy if exists "Allow public read rewards_point_ledger" on public.rewards_point_ledger;
create policy "Allow public read rewards_point_ledger"
  on public.rewards_point_ledger for select
  using (true);

drop policy if exists "Allow public insert rewards_point_ledger" on public.rewards_point_ledger;
create policy "Allow public insert rewards_point_ledger"
  on public.rewards_point_ledger for insert
  with check (true);

create table if not exists public.rewards_referrals (
  id bigint generated always as identity primary key,
  referrer_id bigint not null references public.rewards_users(id) on delete cascade,
  friend_email text not null,
  friend_user_id bigint references public.rewards_users(id) on delete set null,
  status text not null default 'clicked',
  first_order_id bigint references public.shop_orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rewards_referrals enable row level security;

drop policy if exists "Allow public read rewards_referrals" on public.rewards_referrals;
create policy "Allow public read rewards_referrals"
  on public.rewards_referrals for select
  using (true);

drop policy if exists "Allow public insert rewards_referrals" on public.rewards_referrals;
create policy "Allow public insert rewards_referrals"
  on public.rewards_referrals for insert
  with check (true);

create table if not exists public.rewards_coupons (
  id bigint generated always as identity primary key,
  user_id bigint not null references public.rewards_users(id) on delete cascade,
  code text not null unique,
  discount_amount numeric(10,2) not null,
  points_spent integer not null default 0,
  max_uses integer not null default 1,
  uses integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.rewards_coupons enable row level security;

drop policy if exists "Allow public read rewards_coupons" on public.rewards_coupons;
create policy "Allow public read rewards_coupons"
  on public.rewards_coupons for select
  using (true);

drop policy if exists "Allow public insert rewards_coupons" on public.rewards_coupons;
create policy "Allow public insert rewards_coupons"
  on public.rewards_coupons for insert
  with check (true);

drop policy if exists "Allow public update rewards_coupons" on public.rewards_coupons;
create policy "Allow public update rewards_coupons"
  on public.rewards_coupons for update
  using (true)
  with check (true);

create table if not exists public.rewards_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.rewards_settings enable row level security;

drop policy if exists "Allow public read rewards_settings" on public.rewards_settings;
create policy "Allow public read rewards_settings"
  on public.rewards_settings for select
  using (true);

drop policy if exists "Allow public upsert rewards_settings" on public.rewards_settings;
create policy "Allow public upsert rewards_settings"
  on public.rewards_settings for all
  using (true)
  with check (true);

