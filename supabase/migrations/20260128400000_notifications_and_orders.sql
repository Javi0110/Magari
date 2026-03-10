-- Notificaciones in-app (admin y vendors) + pedidos (orders)
-- Ejecuta en Supabase: SQL Editor → New query → Pegar → Run

-- Tabla de notificaciones: para admin (recipient_id null) o para un vendor (recipient_id = vendors.id)
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  recipient_type text not null check (recipient_type in ('admin', 'vendor')),
  recipient_id bigint,
  type text not null,
  title text not null,
  body text default '',
  payload jsonb default '{}',
  read boolean not null default false,
  created_at timestamptz default now() not null
);

create index if not exists idx_notifications_recipient on public.notifications (recipient_type, recipient_id);
create index if not exists idx_notifications_read_created on public.notifications (read, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "Allow read notifications" on public.notifications;
create policy "Allow read notifications" on public.notifications for select using (true);
drop policy if exists "Allow insert notifications" on public.notifications;
create policy "Allow insert notifications" on public.notifications for insert with check (true);
drop policy if exists "Allow update notifications" on public.notifications;
create policy "Allow update notifications" on public.notifications for update using (true);

-- Añadir vendor_id a products (nullable: null = Magari)
alter table public.products add column if not exists vendor_id bigint references public.vendors(id);

-- Pedidos
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_name text not null,
  customer_email text not null,
  shipping_address text default '',
  total numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz default now() not null
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id),
  product_title text not null,
  quantity integer not null default 1,
  price numeric(10,2) not null,
  vendor_id bigint references public.vendors(id),
  created_at timestamptz default now() not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Allow all orders" on public.orders;
create policy "Allow all orders" on public.orders for all using (true) with check (true);
drop policy if exists "Allow all order_items" on public.order_items;
create policy "Allow all order_items" on public.order_items for all using (true) with check (true);

-- Trigger: al insertar una solicitud de vendor, crear notificación para admin
create or replace function public.notify_admin_on_vendor_application()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.notifications (recipient_type, recipient_id, type, title, body, payload)
  values (
    'admin',
    null,
    'vendor_application',
    'Nueva solicitud de vendor: ' || coalesce(NEW.business_name, 'Sin nombre'),
    NEW.name || ' (' || NEW.email || ') quiere vender en el marketplace.',
    jsonb_build_object('application_id', NEW.id, 'business_name', NEW.business_name, 'email', NEW.email)
  );
  return NEW;
end;
$$;

drop trigger if exists on_vendor_application_notify_admin on public.vendor_applications;
create trigger on_vendor_application_notify_admin
  after insert on public.vendor_applications
  for each row execute function public.notify_admin_on_vendor_application();

comment on table public.notifications is 'Notificaciones in-app para admin y vendors';
comment on table public.orders is 'Pedidos del shop';
comment on table public.order_items is 'Líneas de cada pedido';
