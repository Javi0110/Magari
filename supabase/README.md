# Supabase – Magari & Co.

## Migraciones (solo una vez cada una)

### 1. Tabla `products`
1. Entra en [Supabase](https://supabase.com/dashboard) y abre tu proyecto.
2. Ve a **SQL Editor** → **New query**.
3. Copia y pega el contenido de `migrations/20260128000000_create_products.sql`.
4. Pulsa **Run**.

### 2. Tablas `vendor_applications` y `vendors` (MOMade)
1. En el mismo **SQL Editor**, **New query**.
2. Copia y pega el contenido de `migrations/20260128100000_create_vendor_applications_and_vendors.sql`.
3. Pulsa **Run**.

Después de eso, la web podrá usar productos y las solicitudes de vendors del marketplace.
