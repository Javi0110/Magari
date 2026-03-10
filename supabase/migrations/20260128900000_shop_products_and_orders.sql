-- SHOP MAGARI MODULE
-- Products and orders for Magari's own ecommerce (NOT marketplace vendors)
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

create table if not exists public.shop_products (
  id bigint generated always as identity primary key,
  slug text unique,
  title text not null,
  description text default '',
  price numeric(10,2) not null default 0,
  category text default 'Home Decor',
  room text default 'Any',
  materials text default '',
  dimensions text default '',
  images jsonb default '[]'::jsonb,
  tags jsonb default '["magari"]'::jsonb,
  badge text,
  stock integer default 0,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.shop_products enable row level security;

drop policy if exists "Allow public read shop_products" on public.shop_products;
create policy "Allow public read shop_products"
  on public.shop_products for select using (true);

drop policy if exists "Allow public write shop_products" on public.shop_products;
create policy "Allow public write shop_products"
  on public.shop_products for all using (true) with check (true);

comment on table public.shop_products is 'Productos propios de Magari & Co. (Shop Magari).';

-- Basic ecommerce orders for Shop Magari (can coexist con marketplace orders)

create table if not exists public.shop_customers (
  id bigint generated always as identity primary key,
  email text not null,
  name text,
  shipping_address jsonb,
  created_at timestamptz not null default now()
);

alter table public.shop_customers enable row level security;

drop policy if exists "Allow public write shop_customers" on public.shop_customers;
create policy "Allow public write shop_customers"
  on public.shop_customers for all using (true) with check (true);

drop policy if exists "Allow public read own shop_customers" on public.shop_customers;
create policy "Allow public read own shop_customers"
  on public.shop_customers for select using (true);

create table if not exists public.shop_orders (
  id bigint generated always as identity primary key,
  customer_id bigint references public.shop_customers(id) on delete set null,
  customer_email text not null,
  customer_name text,
  total numeric(10,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.shop_orders enable row level security;

drop policy if exists "Allow public write shop_orders" on public.shop_orders;
create policy "Allow public write shop_orders"
  on public.shop_orders for all using (true) with check (true);

drop policy if exists "Allow public read shop_orders" on public.shop_orders;
create policy "Allow public read shop_orders"
  on public.shop_orders for select using (true);

create table if not exists public.shop_order_items (
  id bigint generated always as identity primary key,
  order_id bigint references public.shop_orders(id) on delete cascade,
  product_id bigint references public.shop_products(id) on delete set null,
  product_title text not null,
  price numeric(10,2) not null default 0,
  quantity integer not null default 1
);

alter table public.shop_order_items enable row level security;

drop policy if exists "Allow public write shop_order_items" on public.shop_order_items;
create policy "Allow public write shop_order_items"
  on public.shop_order_items for all using (true) with check (true);

drop policy if exists "Allow public read shop_order_items" on public.shop_order_items;
create policy "Allow public read shop_order_items"
  on public.shop_order_items for select using (true);

