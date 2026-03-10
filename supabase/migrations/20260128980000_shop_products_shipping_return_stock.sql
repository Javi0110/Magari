-- Add shipping and return_policy to shop_products; add RPC to decrement stock
-- Run in Supabase: SQL Editor → New query → Paste → Run

alter table public.shop_products
  add column if not exists shipping text default 'Ships from San Juan, PR to USA & PR',
  add column if not exists return_policy text default '30-day returns accepted';

-- RPC to decrement stock (avoids race conditions, never goes negative)
create or replace function public.decrement_shop_product_stock(p_id bigint, p_qty int)
returns void
language sql
security definer
as $$
  update public.shop_products
  set stock = greatest(0, coalesce(stock, 0) - least(p_qty, coalesce(stock, 0)))
  where id = p_id;
$$;

-- So we only decrement stock once per Stripe session (e.g. on refresh we skip)
create table if not exists public.processed_checkout_sessions (
  session_id text primary key,
  created_at timestamptz not null default now()
);
alter table public.processed_checkout_sessions enable row level security;
drop policy if exists "Allow public write processed_checkout_sessions" on public.processed_checkout_sessions;
create policy "Allow public write processed_checkout_sessions"
  on public.processed_checkout_sessions for all using (true) with check (true);
