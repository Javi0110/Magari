-- Permitir eliminar filas de vendor_applications (para que el Admin pueda borrar solicitudes aprobadas/rechazadas)
-- Ejecuta en Supabase: SQL Editor → New query → Pegar → Run

drop policy if exists "Allow public delete vendor_applications" on public.vendor_applications;
create policy "Allow public delete vendor_applications" on public.vendor_applications for delete using (true);
