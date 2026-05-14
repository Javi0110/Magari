-- Link Stripe Checkout sessions to shop_orders for Rewards dashboard "Your orders"
alter table public.shop_orders
  add column if not exists stripe_checkout_session_id text;

create unique index if not exists shop_orders_stripe_checkout_session_uid
  on public.shop_orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

comment on column public.shop_orders.stripe_checkout_session_id is
  'Stripe Checkout session id (cs_...); one row per paid session for rewards dashboard.';
