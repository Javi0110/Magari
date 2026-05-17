-- Harden RLS: admin-only writes for shop catalog, lock shop_orders to service role,
-- restrict service_requests reads, keep public inserts where forms need them.
-- Sync admin email with VITE_MAGARI_ADMIN_EMAIL / src/constants/admin.js

create or replace function public.is_magari_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'magaribyelena@gmail.com';
$$;

revoke all on function public.is_magari_admin() from public;
grant execute on function public.is_magari_admin() to anon, authenticated;

-- shop_products: public reads active catalog; admin manages all rows when signed in
drop policy if exists "Allow public write shop_products" on public.shop_products;
drop policy if exists "Allow public read shop_products" on public.shop_products;
drop policy if exists "shop_products_public_read_active" on public.shop_products;
drop policy if exists "shop_products_admin_all" on public.shop_products;

create policy "shop_products_public_read_active"
  on public.shop_products
  for select
  to anon, authenticated
  using (is_active = true or public.is_magari_admin());

create policy "shop_products_admin_insert"
  on public.shop_products
  for insert
  to authenticated
  with check (public.is_magari_admin());

create policy "shop_products_admin_update"
  on public.shop_products
  for update
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

create policy "shop_products_admin_delete"
  on public.shop_products
  for delete
  to authenticated
  using (public.is_magari_admin());

-- Catalog RPC: only active products for storefront
create or replace function public.get_shop_products_catalog(p_limit integer default 200)
returns setof public.shop_products
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.shop_products
  where is_active = true
  order by id desc
  limit least(coalesce(nullif(p_limit, 0), 200), 500);
$$;

-- shop_orders / items / customers: service role only (Netlify functions)
drop policy if exists "Allow public write shop_orders" on public.shop_orders;
drop policy if exists "Allow public read shop_orders" on public.shop_orders;
drop policy if exists "Allow public write shop_order_items" on public.shop_order_items;
drop policy if exists "Allow public read shop_order_items" on public.shop_order_items;
drop policy if exists "Allow public write shop_customers" on public.shop_customers;
drop policy if exists "Allow public read own shop_customers" on public.shop_customers;

-- notifications: admin manages admin inbox; vendor rows still readable (vendor auth is a follow-up)
drop policy if exists "Allow read notifications" on public.notifications;
drop policy if exists "Allow insert notifications" on public.notifications;
drop policy if exists "Allow update notifications" on public.notifications;
drop policy if exists "notifications_admin_select" on public.notifications;
drop policy if exists "notifications_admin_update" on public.notifications;
drop policy if exists "notifications_vendor_select" on public.notifications;

create policy "notifications_admin_select"
  on public.notifications
  for select
  to authenticated
  using (
    public.is_magari_admin()
    and recipient_type = 'admin'
    and recipient_id is null
  );

create policy "notifications_admin_update"
  on public.notifications
  for update
  to authenticated
  using (
    public.is_magari_admin()
    and recipient_type = 'admin'
    and recipient_id is null
  )
  with check (
    public.is_magari_admin()
    and recipient_type = 'admin'
    and recipient_id is null
  );

create policy "notifications_vendor_select"
  on public.notifications
  for select
  to anon, authenticated
  using (recipient_type = 'vendor');

create policy "notifications_vendor_update"
  on public.notifications
  for update
  to anon, authenticated
  using (recipient_type = 'vendor')
  with check (recipient_type = 'vendor');

-- service_requests: public can submit; only admin reads/updates
drop policy if exists "Allow public write service_requests" on public.service_requests;
drop policy if exists "Allow public read service_requests" on public.service_requests;
drop policy if exists "service_requests_public_insert" on public.service_requests;
drop policy if exists "service_requests_admin_select" on public.service_requests;
drop policy if exists "service_requests_admin_update" on public.service_requests;
drop policy if exists "service_requests_admin_delete" on public.service_requests;

create policy "service_requests_public_insert"
  on public.service_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "service_requests_admin_select"
  on public.service_requests
  for select
  to authenticated
  using (public.is_magari_admin());

create policy "service_requests_admin_update"
  on public.service_requests
  for update
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

create policy "service_requests_admin_delete"
  on public.service_requests
  for delete
  to authenticated
  using (public.is_magari_admin());
