-- SHOP MAGARI – PRODUCT REVIEWS
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.shop_products(id) on delete cascade,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.product_reviews enable row level security;

-- Cualquiera puede leer reviews
drop policy if exists "Allow public read product_reviews" on public.product_reviews;
create policy "Allow public read product_reviews"
  on public.product_reviews for select
  using (true);

-- Cualquiera puede crear un review (la moderación se puede hacer vía Admin)
drop policy if exists "Allow public insert product_reviews" on public.product_reviews;
create policy "Allow public insert product_reviews"
  on public.product_reviews for insert
  with check (true);

comment on table public.product_reviews is 'Customer reviews for Shop Magari products.';

