-- Let signed-in Magari admin read shop orders in the admin panel (writes stay service-role only).

drop policy if exists "shop_orders_admin_select" on public.shop_orders;
drop policy if exists "shop_order_items_admin_select" on public.shop_order_items;

create policy "shop_orders_admin_select"
  on public.shop_orders
  for select
  to authenticated
  using (public.is_magari_admin());

create policy "shop_order_items_admin_select"
  on public.shop_order_items
  for select
  to authenticated
  using (public.is_magari_admin());
