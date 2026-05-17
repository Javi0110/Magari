-- MOMade marketplace: lock down vendors/products/orders; vendor mutations via RPC + secret.

-- ─── Helpers ───────────────────────────────────────────────────────────────

create or replace function public.vendor_check_secret(p_vendor_id bigint, p_secret text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v public.vendors%rowtype;
  s text := trim(coalesce(p_secret, ''));
begin
  if p_vendor_id is null or s = '' then
    return false;
  end if;
  select * into v from public.vendors where id = p_vendor_id and status = 'active';
  if not found then
    return false;
  end if;
  if trim(coalesce(v.access_code, '')) = s then
    return true;
  end if;
  if v.password is not null and trim(v.password) = s then
    return true;
  end if;
  return false;
end;
$$;

revoke all on function public.vendor_check_secret(bigint, text) from public;
grant execute on function public.vendor_check_secret(bigint, text) to anon, authenticated;

-- Login (no email-only bypass)
create or replace function public.verify_vendor_login(p_email text, p_secret text)
returns table (
  id bigint,
  email text,
  name text,
  business_name text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.vendors%rowtype;
  s text := trim(coalesce(p_secret, ''));
begin
  if trim(coalesce(p_email, '')) = '' or s = '' then
    return;
  end if;
  select * into v
  from public.vendors
  where status = 'active'
    and lower(trim(email)) = lower(trim(p_email))
  limit 1;
  if not found then
    return;
  end if;
  if trim(coalesce(v.access_code, '')) = s or (v.password is not null and trim(v.password) = s) then
    return query
    select v.id, v.email, v.name, v.business_name, v.status;
  end if;
end;
$$;

grant execute on function public.verify_vendor_login(text, text) to anon, authenticated;

-- Public maker directory (no access_code / password)
create or replace view public.vendors_public as
select
  id,
  email,
  name,
  business_name,
  status,
  profile_bio,
  profile_location,
  profile_website,
  profile_instagram,
  profile_avatar_url,
  profile_banner_url,
  published,
  created_at
from public.vendors
where status = 'active';

grant select on public.vendors_public to anon, authenticated;

-- ─── vendor_applications ───────────────────────────────────────────────────

drop policy if exists "Allow public read vendor_applications" on public.vendor_applications;
drop policy if exists "Allow public update vendor_applications" on public.vendor_applications;
drop policy if exists "Allow public delete vendor_applications" on public.vendor_applications;
drop policy if exists "vendor_applications_public_insert" on public.vendor_applications;
drop policy if exists "vendor_applications_admin_all" on public.vendor_applications;

create policy "vendor_applications_public_insert"
  on public.vendor_applications
  for insert
  to anon, authenticated
  with check (true);

create policy "vendor_applications_admin_select"
  on public.vendor_applications
  for select
  to authenticated
  using (public.is_magari_admin());

create policy "vendor_applications_admin_update"
  on public.vendor_applications
  for update
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

create policy "vendor_applications_admin_delete"
  on public.vendor_applications
  for delete
  to authenticated
  using (public.is_magari_admin());

-- ─── vendors (direct table: admin only; public uses vendors_public) ────────

drop policy if exists "Allow public read vendors" on public.vendors;
drop policy if exists "Allow public insert vendors" on public.vendors;
drop policy if exists "Allow public update vendors" on public.vendors;
drop policy if exists "Allow public delete vendors" on public.vendors;
drop policy if exists "vendors_admin_all" on public.vendors;

create policy "vendors_admin_all"
  on public.vendors
  for all
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

-- ─── products (MOMade catalog) ─────────────────────────────────────────────

drop policy if exists "Allow public read access on products" on public.products;
drop policy if exists "Allow public insert access on products" on public.products;
drop policy if exists "Allow public update access on products" on public.products;
drop policy if exists "Allow public delete access on products" on public.products;
drop policy if exists "products_public_read" on public.products;
drop policy if exists "products_admin_all" on public.products;

create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_admin_all"
  on public.products
  for all
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

-- Vendor profile read
create or replace function public.vendor_get_profile(p_vendor_id bigint, p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.vendors%rowtype;
begin
  if not public.vendor_check_secret(p_vendor_id, p_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  select * into v from public.vendors where id = p_vendor_id;
  return jsonb_build_object(
    'profile_bio', coalesce(v.profile_bio, ''),
    'profile_location', coalesce(v.profile_location, ''),
    'profile_website', coalesce(v.profile_website, ''),
    'profile_instagram', coalesce(v.profile_instagram, ''),
    'profile_avatar_url', coalesce(v.profile_avatar_url, ''),
    'published', coalesce(v.published, false)
  );
end;
$$;

grant execute on function public.vendor_get_profile(bigint, text) to anon, authenticated;

create or replace function public.vendor_update_profile(p_vendor_id bigint, p_secret text, p_patch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.vendor_check_secret(p_vendor_id, p_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  update public.vendors set
    profile_bio = coalesce(p_patch->>'profile_bio', profile_bio),
    profile_location = coalesce(p_patch->>'profile_location', profile_location),
    profile_website = coalesce(p_patch->>'profile_website', profile_website),
    profile_instagram = coalesce(p_patch->>'profile_instagram', profile_instagram),
    profile_avatar_url = coalesce(p_patch->>'profile_avatar_url', profile_avatar_url),
    published = coalesce((p_patch->>'published')::boolean, published)
  where id = p_vendor_id;
end;
$$;

grant execute on function public.vendor_update_profile(bigint, text, jsonb) to anon, authenticated;

create or replace function public.vendor_set_password(p_vendor_id bigint, p_current_secret text, p_new_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.vendor_check_secret(p_vendor_id, p_current_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_new_password, ''))) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  update public.vendors set password = trim(p_new_password) where id = p_vendor_id;
end;
$$;

grant execute on function public.vendor_set_password(bigint, text, text) to anon, authenticated;

create or replace function public.vendor_upsert_product(
  p_vendor_id bigint,
  p_secret text,
  p_product jsonb,
  p_product_id bigint default null
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.products%rowtype;
begin
  if not public.vendor_check_secret(p_vendor_id, p_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_product_id is not null then
    update public.products set
      title = coalesce(p_product->>'title', title),
      description = coalesce(p_product->>'description', description),
      price = coalesce((p_product->>'price')::numeric, price),
      category = coalesce(p_product->>'category', category),
      room = coalesce(p_product->>'room', room),
      materials = coalesce(p_product->>'materials', materials),
      dimensions = coalesce(p_product->>'dimensions', dimensions),
      images = coalesce(p_product->'images', images),
      tags = coalesce(p_product->'tags', tags),
      shipping = coalesce(p_product->>'shipping', shipping),
      return_policy = coalesce(p_product->>'return_policy', return_policy),
      stock = coalesce((p_product->>'stock')::integer, stock),
      shipping_options = coalesce(p_product->'shipping_options', shipping_options)
    where id = p_product_id and vendor_id = p_vendor_id
    returning * into result;
    if not found then
      raise exception 'Product not found';
    end if;
    return result;
  end if;

  insert into public.products (
    title, description, price, category, room, materials, dimensions,
    images, tags, vendor, shipping, return_policy, stock, vendor_id, shipping_options
  ) values (
    p_product->>'title',
    coalesce(p_product->>'description', ''),
    coalesce((p_product->>'price')::numeric, 0),
    coalesce(p_product->>'category', 'Other'),
    coalesce(p_product->>'room', 'Any'),
    coalesce(p_product->>'materials', ''),
    coalesce(p_product->>'dimensions', ''),
    coalesce(p_product->'images', '[]'::jsonb),
    coalesce(p_product->'tags', '["maker"]'::jsonb),
    coalesce(p_product->>'vendor', 'maker'),
    coalesce(p_product->>'shipping', ''),
    coalesce(p_product->>'return_policy', '30-day returns accepted'),
    coalesce((p_product->>'stock')::integer, 0),
    p_vendor_id,
    coalesce(p_product->'shipping_options', '{}'::jsonb)
  )
  returning * into result;
  return result;
end;
$$;

grant execute on function public.vendor_upsert_product(bigint, text, jsonb, bigint) to anon, authenticated;

create or replace function public.vendor_delete_product(
  p_vendor_id bigint,
  p_secret text,
  p_product_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.vendor_check_secret(p_vendor_id, p_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  delete from public.products where id = p_product_id and vendor_id = p_vendor_id;
  if not found then
    raise exception 'Product not found';
  end if;
end;
$$;

grant execute on function public.vendor_delete_product(bigint, text, bigint) to anon, authenticated;

create or replace function public.vendor_list_order_items(p_vendor_id bigint, p_secret text)
returns setof public.order_items
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.vendor_check_secret(p_vendor_id, p_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  return query
  select *
  from public.order_items
  where vendor_id = p_vendor_id
  order by created_at desc
  limit 50;
end;
$$;

grant execute on function public.vendor_list_order_items(bigint, text) to anon, authenticated;

-- ─── orders / order_items ──────────────────────────────────────────────────

drop policy if exists "Allow all orders" on public.orders;
drop policy if exists "Allow all order_items" on public.order_items;
drop policy if exists "orders_admin_select" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;
drop policy if exists "order_items_admin_select" on public.order_items;

create policy "orders_admin_select"
  on public.orders
  for select
  to authenticated
  using (public.is_magari_admin());

create policy "orders_admin_update"
  on public.orders
  for update
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

create policy "order_items_admin_select"
  on public.order_items
  for select
  to authenticated
  using (public.is_magari_admin());
