-- Run this in Supabase → SQL Editor if you see:
-- "Could not find the 'fulfillment' column of 'shop_products' in the schema cache"
alter table public.shop_products
  add column if not exists fulfillment text not null default 'shipping';

comment on column public.shop_products.fulfillment is
  'JSON array of modes, e.g. ["shipping","delivery"], or legacy single token. Modes: local_pickup_only, shipping, delivery.';
