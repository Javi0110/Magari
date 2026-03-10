-- Notificaciones vía Zapier/Make: al insertar en vendor_applications se hace POST a la URL que guardes en app_settings.
-- 1. Ejecuta esta migración en Supabase (SQL Editor).
-- 2. En Admin → Settings pega la URL de "Webhooks by Zapier" (Catch Hook) y guarda.
-- 3. En Zapier crea un Zap: Trigger "Catch Hook" → Action "Email" a magaribyelena@gmail.com.

-- Activa pg_net desde Dashboard → Database → Extensions si no está. Luego ejecuta el resto.
create extension if not exists pg_net;

create table if not exists public.app_settings (
  key text primary key,
  value text not null default ''
);

alter table public.app_settings enable row level security;

drop policy if exists "Allow read app_settings" on public.app_settings;
create policy "Allow read app_settings" on public.app_settings for select using (true);
drop policy if exists "Allow insert app_settings" on public.app_settings;
create policy "Allow insert app_settings" on public.app_settings for insert with check (true);
drop policy if exists "Allow update app_settings" on public.app_settings;
create policy "Allow update app_settings" on public.app_settings for update using (true);

insert into public.app_settings (key, value) values ('zapier_webhook_url', '')
on conflict (key) do nothing;

create or replace function public.notify_zapier_on_vendor_application()
returns trigger language plpgsql security definer
set search_path = public, net
as $$
declare
  webhook_url text;
  payload jsonb;
begin
  select value into webhook_url from public.app_settings where key = 'zapier_webhook_url' limit 1;
  if webhook_url is null or trim(webhook_url) = '' then
    return NEW;
  end if;
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', null
  );
  perform net.http_post(
    url := trim(webhook_url),
    body := payload,
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return NEW;
end;
$$;

drop trigger if exists on_vendor_application_notify_zapier on public.vendor_applications;
create trigger on_vendor_application_notify_zapier
  after insert on public.vendor_applications
  for each row execute function public.notify_zapier_on_vendor_application();
