-- Permitir eliminar filas de vendors (para borrar cuentas de vendors desde el Admin)
-- Ejecuta en Supabase: SQL Editor → New query → Pegar → Run

drop policy if exists "Allow public delete vendors" on public.vendors;
create policy "Allow public delete vendors" on public.vendors for delete using (true);

