-- SERVICE REQUESTS (Design Services)
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

create table if not exists public.service_requests (
  id bigint generated always as identity primary key,
  service text not null,
  reference text not null,
  contact jsonb not null,
  subtotal numeric(10,2) not null default 0,
  deposit numeric(10,2) not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.service_requests enable row level security;

drop policy if exists "Allow public write service_requests" on public.service_requests;
create policy "Allow public write service_requests"
  on public.service_requests for all
  using (true) with check (true);

drop policy if exists "Allow public read service_requests" on public.service_requests;
create policy "Allow public read service_requests"
  on public.service_requests for select
  using (true);

