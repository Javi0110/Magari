-- Harden vendor_payouts: admin via RLS, vendors via RPC only.

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
