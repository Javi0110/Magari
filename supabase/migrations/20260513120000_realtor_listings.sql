-- Active MLS / portal listings shown on /real-estate; managed from Admin → Listings.
-- Requires Supabase Auth user magaribyelena@gmail.com (same as consultations RLS).

create or replace function public.realtor_listings_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.realtor_listings (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  sort_order integer not null default 0,
  headline text not null,
  price_display text not null default '',
  address_display text not null default '',
  summary text not null default '',
  beds numeric(4, 1),
  baths numeric(4, 1),
  sqft integer,
  listing_url text not null default '',
  cover_image_url text not null default '',
  gallery_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint realtor_listings_status_check check (
    status in ('draft', 'active', 'sold', 'archived')
  )
);

create index if not exists idx_realtor_listings_status_sort
  on public.realtor_listings (status, sort_order, created_at desc);

comment on table public.realtor_listings is 'Realtor active/sold listings; public reads status=active; admin CRUD via JWT.';

drop trigger if exists trg_realtor_listings_updated on public.realtor_listings;
create trigger trg_realtor_listings_updated
  before update on public.realtor_listings
  for each row execute function public.realtor_listings_touch_updated_at();

alter table public.realtor_listings enable row level security;

-- Public: only active listings (for /real-estate)
drop policy if exists "realtor_listings_select_public_active" on public.realtor_listings;
create policy "realtor_listings_select_public_active"
  on public.realtor_listings for select
  to anon, authenticated
  using (status = 'active');

-- Admin: all rows
drop policy if exists "realtor_listings_select_admin" on public.realtor_listings;
create policy "realtor_listings_select_admin"
  on public.realtor_listings for select
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "realtor_listings_insert_admin" on public.realtor_listings;
create policy "realtor_listings_insert_admin"
  on public.realtor_listings for insert
  to authenticated
  with check (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "realtor_listings_update_admin" on public.realtor_listings;
create policy "realtor_listings_update_admin"
  on public.realtor_listings for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com')
  with check (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

drop policy if exists "realtor_listings_delete_admin" on public.realtor_listings;
create policy "realtor_listings_delete_admin"
  on public.realtor_listings for delete
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com');

grant select on public.realtor_listings to anon, authenticated;
grant insert, update, delete on public.realtor_listings to authenticated;
