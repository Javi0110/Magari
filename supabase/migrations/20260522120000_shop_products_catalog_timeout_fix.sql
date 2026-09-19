-- Shop catalog timeouts (57014): RLS `is_active OR is_magari_admin()` forces a
-- per-row JWT check and blocks an index-only scan. Split policies and give the
-- storefront RPC a higher statement_timeout again (dropped on recreate in 20260516).

create index if not exists idx_shop_products_active_id_desc
  on public.shop_products (id desc)
  where is_active = true;

drop policy if exists "shop_products_public_read_active" on public.shop_products;
drop policy if exists "shop_products_admin_select" on public.shop_products;
drop policy if exists "Allow public read shop_products" on public.shop_products;

create policy "shop_products_public_read_active"
  on public.shop_products
  for select
  to anon, authenticated
  using (is_active = true);

create policy "shop_products_admin_select"
  on public.shop_products
  for select
  to authenticated
  using (public.is_magari_admin());

create or replace function public.get_shop_products_catalog(p_limit integer default 120)
returns setof public.shop_products
language sql
stable
security definer
set search_path = public
set statement_timeout = '60s'
as $$
  select *
  from public.shop_products
  where is_active = true
  order by id desc
  limit least(greatest(coalesce(p_limit, 120), 1), 200);
$$;

grant execute on function public.get_shop_products_catalog(integer) to anon, authenticated;
