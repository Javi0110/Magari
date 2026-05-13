-- Internal consultation booking (no third-party scheduler)
-- Run in Supabase SQL Editor if not using CLI migrations.
-- After deploy: Authentication → Users → create user magaribyelena@gmail.com (same password as admin panel) for RLS.

-- ---------------------------------------------------------------------------
-- admin_settings (single row)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  timezone text not null default 'America/Chicago',
  booking_buffer_minutes integer not null default 30,
  max_bookings_per_day integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (id, timezone, booking_buffer_minutes, max_bookings_per_day)
values ('00000000-0000-4000-8000-000000000001'::uuid, 'America/Chicago', 30, 5)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- availability_slots
-- ---------------------------------------------------------------------------
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_slots_time_order check (end_time > start_time)
);

create index if not exists idx_availability_slots_start on public.availability_slots (start_time);
create index if not exists idx_availability_slots_available_start
  on public.availability_slots (start_time) where (is_available = true);

-- ---------------------------------------------------------------------------
-- consultation_requests
-- ---------------------------------------------------------------------------
create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  service_type text not null,
  message text,
  requested_slot_id uuid not null references public.availability_slots (id) on delete restrict,
  status text not null default 'new',
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultation_requests_service_type_check check (
    service_type in ('interior_design', 'staging', 'virtual_design', 'buyer', 'seller', 'other')
  ),
  constraint consultation_requests_status_check check (
    status in ('new', 'contacted', 'scheduled', 'completed', 'archived')
  )
);

create index if not exists idx_consultation_requests_created on public.consultation_requests (created_at desc);
create index if not exists idx_consultation_requests_status on public.consultation_requests (status);
create index if not exists idx_consultation_requests_slot on public.consultation_requests (requested_slot_id);

-- One active pipeline booking per slot (prevents double-booking)
create unique index if not exists consultation_one_active_per_slot
  on public.consultation_requests (requested_slot_id)
  where status in ('new', 'contacted', 'scheduled');

-- ---------------------------------------------------------------------------
-- updated_at triggers (namespaced function)
-- ---------------------------------------------------------------------------
create or replace function public.consultation_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_availability_slots_updated on public.availability_slots;
create trigger trg_availability_slots_updated
  before update on public.availability_slots
  for each row execute function public.consultation_touch_updated_at();

drop trigger if exists trg_consultation_requests_updated on public.consultation_requests;
create trigger trg_consultation_requests_updated
  before update on public.consultation_requests
  for each row execute function public.consultation_touch_updated_at();

drop trigger if exists trg_admin_settings_updated on public.admin_settings;
create trigger trg_admin_settings_updated
  before update on public.admin_settings
  for each row execute function public.consultation_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RPC: atomic book slot + insert request (anon can execute)
-- ---------------------------------------------------------------------------
create or replace function public.create_consultation_request(
  p_slot_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_service_type text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_now timestamptz := now();
  v_buffer int := 30;
begin
  select booking_buffer_minutes into v_buffer from public.admin_settings limit 1;
  if v_buffer is null then v_buffer := 30; end if;

  if p_full_name is null or trim(p_full_name) = '' then
    raise exception 'full_name_required';
  end if;
  if p_email is null or trim(p_email) = '' then
    raise exception 'email_required';
  end if;
  if p_service_type not in ('interior_design', 'staging', 'virtual_design', 'buyer', 'seller', 'other') then
    raise exception 'invalid_service_type';
  end if;

  update public.availability_slots s
  set is_available = false, updated_at = v_now
  where s.id = p_slot_id
    and s.is_available = true
    and s.start_time >= v_now + (v_buffer || ' minutes')::interval;

  if not found then
    raise exception 'slot_unavailable';
  end if;

  insert into public.consultation_requests (
    full_name, email, phone, service_type, message, requested_slot_id, status
  ) values (
    trim(p_full_name),
    lower(trim(p_email)),
    coalesce(trim(p_phone), ''),
    p_service_type,
    nullif(trim(p_message), ''),
    p_slot_id,
    'new'
  )
  returning id into v_id;

  return v_id;
exception
  when unique_violation then
    update public.availability_slots set is_available = true, updated_at = v_now where id = p_slot_id;
    raise exception 'slot_already_booked';
end;
$$;

grant execute on function public.create_consultation_request(uuid, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_settings enable row level security;
alter table public.availability_slots enable row level security;
alter table public.consultation_requests enable row level security;

-- admin_settings: anyone can read (buffer / timezone for UI); admin JWT writes
drop policy if exists "admin_settings_select_public" on public.admin_settings;
create policy "admin_settings_select_public"
  on public.admin_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_settings_write_admin" on public.admin_settings;
create policy "admin_settings_update_admin"
  on public.admin_settings for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

-- availability_slots: public sees only bookable future slots
drop policy if exists "slots_select_public_available" on public.availability_slots;
create policy "slots_select_public_available"
  on public.availability_slots for select
  to anon
  using (is_available = true and end_time > now());

drop policy if exists "slots_select_admin_all" on public.availability_slots;
create policy "slots_select_admin_all"
  on public.availability_slots for select
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "slots_write_admin" on public.availability_slots;
create policy "slots_write_admin"
  on public.availability_slots for insert
  to authenticated
  with check (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "slots_update_admin" on public.availability_slots;
create policy "slots_update_admin"
  on public.availability_slots for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "slots_delete_admin" on public.availability_slots;
create policy "slots_delete_admin"
  on public.availability_slots for delete
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

-- consultation_requests: no direct anon insert — use create_consultation_request RPC only
drop policy if exists "consultation_insert_anon" on public.consultation_requests;

revoke insert on public.consultation_requests from anon;
revoke insert on public.consultation_requests from authenticated;

drop policy if exists "consultation_select_admin" on public.consultation_requests;
create policy "consultation_select_admin"
  on public.consultation_requests for select
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "consultation_update_admin" on public.consultation_requests;
create policy "consultation_update_admin"
  on public.consultation_requests for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "consultation_delete_admin" on public.consultation_requests;
create policy "consultation_delete_admin"
  on public.consultation_requests for delete
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

comment on table public.availability_slots is 'Bookable time windows; public reads available; admin manages.';
comment on table public.consultation_requests is 'Consultation bookings; created via create_consultation_request RPC.';
comment on function public.create_consultation_request is 'Atomically marks slot unavailable and inserts consultation_requests row.';

-- Re-open slot when request is completed or archived (optional reuse)
create or replace function public.consultation_free_slot_on_terminal_status()
returns trigger language plpgsql as $$
begin
  if new.status in ('completed', 'archived')
     and (tg_op = 'INSERT' or coalesce(old.status, '') is distinct from new.status) then
    update public.availability_slots
    set is_available = true, updated_at = now()
    where id = new.requested_slot_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_consultation_free_slot on public.consultation_requests;
create trigger trg_consultation_free_slot
  after insert or update of status on public.consultation_requests
  for each row
  when (new.status in ('completed', 'archived'))
  execute function public.consultation_free_slot_on_terminal_status();
