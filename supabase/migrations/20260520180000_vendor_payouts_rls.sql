-- Vendor payouts table + hardened RLS (safe if 20260129010000 was never applied).

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

create index if not exists idx_vendor_payouts_vendor_id on public.vendor_payouts(vendor_id);
create index if not exists idx_vendor_payouts_created_at on public.vendor_payouts(created_at);

comment on table public.vendor_payouts is 'Manual payout records for each marketplace vendor (admin + vendor history).';

alter table public.vendor_payouts enable row level security;

drop policy if exists "Allow public all vendor_payouts" on public.vendor_payouts;

drop policy if exists "vendor_payouts_admin_select" on public.vendor_payouts;
drop policy if exists "vendor_payouts_admin_insert" on public.vendor_payouts;
drop policy if exists "vendor_payouts_admin_update" on public.vendor_payouts;

create policy "vendor_payouts_admin_select"
  on public.vendor_payouts
  for select
  to authenticated
  using (public.is_magari_admin());

create policy "vendor_payouts_admin_insert"
  on public.vendor_payouts
  for insert
  to authenticated
  with check (public.is_magari_admin());

create policy "vendor_payouts_admin_update"
  on public.vendor_payouts
  for update
  to authenticated
  using (public.is_magari_admin())
  with check (public.is_magari_admin());

create or replace function public.vendor_list_payouts(p_vendor_id bigint, p_secret text)
returns table (amount numeric, status text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.vendor_check_secret(p_vendor_id, p_secret) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  return query
  select vp.amount, vp.status
  from public.vendor_payouts vp
  where vp.vendor_id = p_vendor_id;
end;
$$;

revoke all on function public.vendor_list_payouts(bigint, text) from public;
grant execute on function public.vendor_list_payouts(bigint, text) to anon, authenticated;
