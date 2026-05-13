-- Public images for realtor listings (Admin upload → public URLs on realtor_listings rows).
-- After run: Storage → realtor-listings should appear as public; tune file size / MIME in Dashboard if needed.

insert into storage.buckets (id, name, public)
values ('realtor-listings', 'realtor-listings', true)
on conflict (id) do update set public = true, name = excluded.name;

-- Anyone can read (used on /real-estate without auth)
drop policy if exists "realtor_listings_storage_select_public" on storage.objects;
create policy "realtor_listings_storage_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'realtor-listings');

drop policy if exists "realtor_listings_storage_insert_admin" on storage.objects;
create policy "realtor_listings_storage_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'realtor-listings'
    and coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com'
  );

drop policy if exists "realtor_listings_storage_update_admin" on storage.objects;
create policy "realtor_listings_storage_update_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'realtor-listings'
    and coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com'
  )
  with check (
    bucket_id = 'realtor-listings'
    and coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com'
  );

drop policy if exists "realtor_listings_storage_delete_admin" on storage.objects;
create policy "realtor_listings_storage_delete_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'realtor-listings'
    and coalesce(auth.jwt() ->> 'email', '') = 'magaribyelena@gmail.com'
  );
