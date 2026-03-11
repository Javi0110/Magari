-- Vendor payouts tracking for MOMade Marketplace
-- Run in Supabase: SQL Editor → New query → Paste → Run

create table if not exists public.vendor_payouts (
  id bigint generated always as identity primary key,
  vendor_id bigint not null references public.vendors(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  status text not null default 'paid' check (status in ('pending', 'paid', 'cancelled')),
  payment_method text default '',
  payment_reference text default '',
  notes text default '',
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.vendor_payouts enable row level security;

drop policy if exists "Allow public all vendor_payouts" on public.vendor_payouts;
create policy "Allow public all vendor_payouts"
  on public.vendor_payouts for all using (true) with check (true);

create index if not exists idx_vendor_payouts_vendor_id on public.vendor_payouts(vendor_id);
create index if not exists idx_vendor_payouts_created_at on public.vendor_payouts(created_at);

comment on table public.vendor_payouts is 'Manual payout records for each marketplace vendor (admin + vendor history).';
