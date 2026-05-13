-- =============================================================================
-- PEGA ESTO EN SUPABASE → SQL EDITOR → RUN (una sola vez por proyecto)
-- Añade columnas que la app espera si aún no existen.
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

-- Index para order by created_at desc (usado por la tienda/admin)
create index if not exists idx_shop_products_created_at_desc
  on public.shop_products (created_at desc);

-- RLS de lectura pública simple (rápida y predecible)
alter table public.shop_products enable row level security;
drop policy if exists "Allow public read shop_products" on public.shop_products;
create policy "Allow public read shop_products"
  on public.shop_products
  for select
  to anon, authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- RPC catálogo Shop (si la app sigue con timeout 57014, el cliente llama esto)
-- -----------------------------------------------------------------------------

create or replace function public.get_shop_products_catalog(p_limit integer default 200)
returns setof public.shop_products
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.shop_products
  order by id desc
  limit least(coalesce(nullif(p_limit, 0), 200), 500);
$$;

alter function public.get_shop_products_catalog(integer) set statement_timeout = '60s';

grant execute on function public.get_shop_products_catalog(integer) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Consultas internas (calendario + solicitudes): copia y ejecuta TODO el archivo
-- supabase/migrations/20260413120000_consultation_booking.sql
-- Luego en Authentication crea usuario magaribyelena@gmail.com (misma clave que /admin)
-- para que las pestañas Consultations / Availability lean Supabase con RLS.
-- -----------------------------------------------------------------------------
