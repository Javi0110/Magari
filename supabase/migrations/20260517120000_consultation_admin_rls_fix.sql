-- Fix RLS for consultation admin: JWT email claim can be missing or differ in casing.
-- Use auth.users (source of truth) inside SECURITY DEFINER, with JWT fallback.

create or replace function public.is_consultation_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    return false;
  end if;

  select lower(trim(coalesce(u.email, ''))) into v_email
  from auth.users u
  where u.id = auth.uid();

  if v_email = 'magaribyelena@gmail.com' then
    return true;
  end if;

  return lower(trim(coalesce(auth.jwt() ->> 'email', ''))) = 'magaribyelena@gmail.com';
end;
$$;

comment on function public.is_consultation_admin() is
  'True when signed-in user is the Magari consultation admin (email match via auth.users, JWT fallback).';

grant execute on function public.is_consultation_admin() to authenticated;

-- admin_settings
drop policy if exists "admin_settings_update_admin" on public.admin_settings;
create policy "admin_settings_update_admin"
  on public.admin_settings for update
  to authenticated
  using (public.is_consultation_admin())
  with check (public.is_consultation_admin());

-- availability_slots
drop policy if exists "slots_select_admin_all" on public.availability_slots;
create policy "slots_select_admin_all"
  on public.availability_slots for select
  to authenticated
  using (public.is_consultation_admin());

drop policy if exists "slots_write_admin" on public.availability_slots;
create policy "slots_write_admin"
  on public.availability_slots for insert
  to authenticated
  with check (public.is_consultation_admin());

drop policy if exists "slots_update_admin" on public.availability_slots;
create policy "slots_update_admin"
  on public.availability_slots for update
  to authenticated
  using (public.is_consultation_admin())
  with check (public.is_consultation_admin());

drop policy if exists "slots_delete_admin" on public.availability_slots;
create policy "slots_delete_admin"
  on public.availability_slots for delete
  to authenticated
  using (public.is_consultation_admin());

-- consultation_requests
drop policy if exists "consultation_select_admin" on public.consultation_requests;
create policy "consultation_select_admin"
  on public.consultation_requests for select
  to authenticated
  using (public.is_consultation_admin());

drop policy if exists "consultation_update_admin" on public.consultation_requests;
create policy "consultation_update_admin"
  on public.consultation_requests for update
  to authenticated
  using (public.is_consultation_admin())
  with check (public.is_consultation_admin());

drop policy if exists "consultation_delete_admin" on public.consultation_requests;
create policy "consultation_delete_admin"
  on public.consultation_requests for delete
  to authenticated
  using (public.is_consultation_admin());
