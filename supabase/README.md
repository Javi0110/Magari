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

### 5. Email al vendor al aprobar/rechazar (Resend)
Para que el vendor reciba un email cuando su solicitud sea aprobada o rechazada:

1. Crea una cuenta en [Resend](https://resend.com) y obtén tu **API Key**.
2. En el Dashboard de Supabase: **Project Settings** → **Edge Functions** → **Secrets**. Añade:
   - `RESEND_API_KEY` = tu API key de Resend.
   - (Opcional) `RESEND_FROM_EMAIL` = por ejemplo `Magari <notificaciones@tudominio.com>` si tienes dominio verificado en Resend; si no, se usa `onboarding@resend.dev`.
3. Despliega la función desde la terminal (en la raíz del proyecto):
   ```bash
   npx supabase functions deploy send-vendor-email
   ```
   (Si no tienes Supabase CLI, instálalo: `npm i -g supabase`. Luego haz login: `supabase login` y enlaza el proyecto: `supabase link --project-ref lvzmbghugqnetkosbbpr`.)

Si no despliegas la función, la app usa el relay Netlify + Resend (`send-vendor-email`) si el sitio está en Netlify o si defines `VITE_VENDOR_EMAIL_RELAY_URL` en `.env` para pruebas locales.
