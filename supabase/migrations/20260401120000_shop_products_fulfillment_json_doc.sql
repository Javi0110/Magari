-- Document JSON array storage for shop_products.fulfillment (multi-select in Admin).
-- App still accepts legacy single values: shipping | delivery | local_pickup_only | shipping_and_delivery
comment on column public.shop_products.fulfillment is 'JSON array of modes, e.g. ["shipping","delivery"], or legacy single token. Modes: local_pickup_only, shipping, delivery.';
