-- =============================================================================
-- PEGA ESTO EN SUPABASE → SQL EDITOR → RUN (una sola vez por proyecto)
-- Añade columnas que la app espera si aún no existen.
--
-- NOTA: Si "Your orders" en Rewards no lista compras Stripe, ejecuta también en SQL Editor:
-- supabase/migrations/20260520120000_shop_orders_stripe_session.sql
-- =============================================================================

-- Shop Magari (admin): fulfillment modes (JSON array o texto legacy)
alter table public.shop_products
  add column if not exists fulfillment text not null default 'shipping';

-- Marketplace: opciones de envío / pickup / delivery por producto (vendor)
alter table public.products
  add column if not exists shipping_options jsonb default '{}'::jsonb;

-- (Opcional) Si products no tuviera vendor_id aún:
alter table public.products
  add column if not exists vendor_id bigint references public.vendors(id);

-- -----------------------------------------------------------------------------
-- HARDENING SHOP_PRODUCTS (evita timeouts y asegura lectura pública para Shop)
-- -----------------------------------------------------------------------------

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

create index if not exists idx_shop_products_created_at_desc
  on public.shop_products (created_at desc);

create index if not exists idx_shop_products_active_id_desc
  on public.shop_products (id desc)
  where is_active = true;

alter table public.shop_products enable row level security;
drop policy if exists "Allow public read shop_products" on public.shop_products;
drop policy if exists "shop_products_public_read_active" on public.shop_products;
drop policy if exists "shop_products_admin_select" on public.shop_products;

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

create or replace function public.get_shop_products_catalog(p_limit integer default 48)
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
  limit least(greatest(coalesce(p_limit, 48), 1), 100);
$$;

grant execute on function public.get_shop_products_catalog(integer) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Consultas internas (calendario + solicitudes): copia y ejecuta TODO el archivo
-- supabase/migrations/20260413120000_consultation_booking.sql
-- Luego en Authentication crea usuario magaribyelena@gmail.com (misma clave que /admin)
-- para que las pestañas Consultations / Availability lean Supabase con RLS.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Listings en /real-estate: ejecuta supabase/migrations/20260513120000_realtor_listings.sql
-- (usa el trigger realtor_listings_touch_updated_at definido en este archivo).
-- Admin → pestaña Listings (misma sesión Supabase que Consultations).
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Fotos listings (subida desde Admin): supabase/migrations/20260514120000_realtor_listings_storage.sql
-- Bucket público realtor-listings; subir archivos requiere JWT magaribyelena@gmail.com.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- RPC listings activos (web pública): supabase/migrations/20260515120000_get_active_realtor_listings_rpc.sql
-- Asegura que /real-estate pueda leer listings sin depender solo de RLS directo.
-- -----------------------------------------------------------------------------
