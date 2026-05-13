-- Public read of active listings via RPC (bypasses RLS edge cases for anonymous site visitors).
-- The table still uses RLS for direct access; this function runs as owner and only returns active rows.

create or replace function public.get_active_realtor_listings()
returns setof public.realtor_listings
language sql
security definer
set search_path = public
stable
as $$
  select *
  from public.realtor_listings
  where status = 'active'
  order by sort_order asc, created_at desc;
$$;

grant execute on function public.get_active_realtor_listings() to anon, authenticated;

comment on function public.get_active_realtor_listings is 'Active realtor listings for the public Real Estate page.';
