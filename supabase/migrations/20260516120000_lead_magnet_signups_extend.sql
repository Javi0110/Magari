-- Extra fields for Home Prep Checklist + safer RLS (insert-only for anon).

alter table public.lead_magnet_signups
  add column if not exists phone text,
  add column if not exists service_interest text;

drop policy if exists "Allow all lead_magnet_signups" on public.lead_magnet_signups;

-- Anyone may submit a lead; reads stay with service role / dashboard SQL.
create policy "lead_magnet_signups_insert_public"
  on public.lead_magnet_signups
  for insert
  to anon, authenticated
  with check (true);

grant insert on public.lead_magnet_signups to anon, authenticated;
