-- Keep Shop Magari fast and stable for anon reads.

create index if not exists idx_shop_products_created_at_desc
  on public.shop_products (created_at desc);

alter table public.shop_products enable row level security;

drop policy if exists "Allow public read shop_products" on public.shop_products;
create policy "Allow public read shop_products"
  on public.shop_products
  for select
  to anon, authenticated
  using (true);
