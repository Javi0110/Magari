-- Tabla products para Magari & Co. (Shop + Admin)
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

create table if not exists public.products (
  id bigint generated always as identity primary key,
  title text not null,
  description text default '',
  price numeric(10,2) not null default 0,
  category text default 'Handmade',
  room text default 'Any',
  materials text default '',
  dimensions text default '',
  images jsonb default '[]'::jsonb,
  tags jsonb default '["magari"]'::jsonb,
  vendor text default 'magari',
  shipping text default 'Ships from San Juan, PR to USA & PR',
  return_policy text default '30-day returns accepted',
  stock integer default 0,
  created_at timestamptz default now() not null
);

-- Permitir lectura y escritura con la anon key (ajusta RLS después si quieres restringir)
alter table public.products enable row level security;

drop policy if exists "Allow public read access on products" on public.products;
create policy "Allow public read access on products"
  on public.products for select using (true);

drop policy if exists "Allow public insert access on products" on public.products;
create policy "Allow public insert access on products"
  on public.products for insert with check (true);

drop policy if exists "Allow public update access on products" on public.products;
create policy "Allow public update access on products"
  on public.products for update using (true);

drop policy if exists "Allow public delete access on products" on public.products;
create policy "Allow public delete access on products"
  on public.products for delete using (true);

comment on table public.products is 'Productos del shop Magari & Co.';
