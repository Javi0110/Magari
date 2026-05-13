-- Admin writes to availability_slots via SECURITY DEFINER RPCs (bypass RLS after email check).
-- Fixes "new row violates row-level security" when direct INSERT policies mis-evaluate.

create or replace function public._assert_consultation_admin_slot_writer()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and lower(trim(coalesce(u.email, ''))) = 'magaribyelena@gmail.com'
  ) then
    return;
  end if;
  if lower(trim(coalesce(auth.jwt() ->> 'email', ''))) = 'magaribyelena@gmail.com' then
    return;
  end if;
  raise exception 'forbidden' using errcode = '42501';
end;
$$;

create or replace function public.admin_insert_availability_slots(p_rows jsonb)
returns setof public.availability_slots
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._assert_consultation_admin_slot_writer();

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    return;
  end if;

  return query
  insert into public.availability_slots (start_time, end_time, is_available)
  select
    (elem ->> 'start_time')::timestamptz,
    (elem ->> 'end_time')::timestamptz,
    coalesce((elem ->> 'is_available')::boolean, true)
  from jsonb_array_elements(p_rows) as elem
  returning *;
end;
$$;

create or replace function public.admin_delete_availability_slot(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public._assert_consultation_admin_slot_writer();
  delete from public.availability_slots where id = p_id;
end;
$$;

create or replace function public.admin_set_availability_slot(p_id uuid, p_is_available boolean)
returns public.availability_slots
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.availability_slots;
begin
  perform public._assert_consultation_admin_slot_writer();
  update public.availability_slots
  set is_available = p_is_available, updated_at = now()
  where id = p_id
  returning * into r;
  if r is null then
    raise exception 'slot_not_found' using errcode = 'P0002';
  end if;
  return r;
end;
$$;

comment on function public.admin_insert_availability_slots(jsonb) is
  'Bulk insert availability windows; admin only; bypasses RLS.';

grant execute on function public._assert_consultation_admin_slot_writer() to authenticated;
grant execute on function public.admin_insert_availability_slots(jsonb) to authenticated;
grant execute on function public.admin_delete_availability_slot(uuid) to authenticated;
grant execute on function public.admin_set_availability_slot(uuid, boolean) to authenticated;
