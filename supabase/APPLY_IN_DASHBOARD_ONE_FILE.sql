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
