-- Fulfillment options for Shop Magari: local_pickup_only | shipping | delivery | shipping_and_delivery
alter table public.shop_products
  add column if not exists fulfillment text not null default 'shipping';

comment on column public.shop_products.fulfillment is 'local_pickup_only | shipping | delivery | shipping_and_delivery';
