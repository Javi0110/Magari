-- Marketplace vendor products: fulfillment checkboxes, prices, pickup + delivery radius (JSON)
alter table public.products
  add column if not exists shipping_options jsonb default '{}'::jsonb;

comment on column public.products.shipping_options is
  'Vendor fulfillment: { delivery, pickup, shipping, prices: {delivery,pickup,shipping}, pickupLocation, deliveryOriginAddress, deliveryRadiusMiles }';
