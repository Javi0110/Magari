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

### 3. Notificaciones in-app y pedidos
1. **SQL Editor** → **New query** → pega el contenido de `migrations/20260128400000_notifications_and_orders.sql` → **Run**.

Con eso tendrás: notificaciones en el perfil de Admin y en el perfil de cada vendor (solicitudes de vendor y compras), y la tabla de pedidos para el checkout.

### 4. Notificaciones por email con Zapier (opcional)
Si además quieres recibir un email cuando alguien solicite ser vendor: en **Database** → **Extensions** activa **pg_net**, ejecuta `migrations/20260128300000_zapier_webhook_trigger.sql`, y en **Admin** → **Settings** guarda la URL de tu Zap.
