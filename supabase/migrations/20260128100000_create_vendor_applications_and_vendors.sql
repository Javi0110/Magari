-- Solicitudes de vendor (MOMade Marketplace) y tabla de vendors aprobados
-- Ejecuta en Supabase: SQL Editor → New query → Pegar → Run

-- Solicitudes con respuestas del formulario
create table if not exists public.vendor_applications (
  id bigint generated always as identity primary key,
  name text not null,
  business_name text not null,
  email text not null,
  phone text default '',
  instagram text default '',
  categories text[] default '{}',
  bio text default '',
  payout_method text default 'paypal',
  payout_email text not null,
  form_data jsonb default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now() not null,
  reviewed_at timestamptz,
  created_at timestamptz default now() not null
);

-- Vendors aprobados: credenciales de acceso (email + access_code para entrar a su tienda)
create table if not exists public.vendors (
  id bigint generated always as identity primary key,
  application_id bigint references public.vendor_applications(id),
  email text not null unique,
  name text not null,
  business_name text not null,
  access_code text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz default now() not null
);

alter table public.vendor_applications enable row level security;
alter table public.vendors enable row level security;

drop policy if exists "Allow public read vendor_applications" on public.vendor_applications;
create policy "Allow public read vendor_applications" on public.vendor_applications for select using (true);
drop policy if exists "Allow public insert vendor_applications" on public.vendor_applications;
create policy "Allow public insert vendor_applications" on public.vendor_applications for insert with check (true);
drop policy if exists "Allow public update vendor_applications" on public.vendor_applications;
create policy "Allow public update vendor_applications" on public.vendor_applications for update using (true);

drop policy if exists "Allow public read vendors" on public.vendors;
create policy "Allow public read vendors" on public.vendors for select using (true);
drop policy if exists "Allow public insert vendors" on public.vendors;
create policy "Allow public insert vendors" on public.vendors for insert with check (true);
drop policy if exists "Allow public update vendors" on public.vendors;
create policy "Allow public update vendors" on public.vendors for update using (true);

comment on table public.vendor_applications is 'Solicitudes MOMade marketplace';
comment on table public.vendors is 'Vendors aprobados con acceso a su tienda';
