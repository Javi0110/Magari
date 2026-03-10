-- Lead magnet signups for "5 Design Secrets That Help Homes Sell Faster"

create table if not exists public.lead_magnet_signups (
  id bigint generated always as identity primary key,
  email text not null,
  name text,
  source text not null default '5-design-secrets',
  created_at timestamptz not null default now()
);

alter table public.lead_magnet_signups enable row level security;

drop policy if exists "Allow all lead_magnet_signups" on public.lead_magnet_signups;
create policy "Allow all lead_magnet_signups" on public.lead_magnet_signups
  for all using (true) with check (true);

