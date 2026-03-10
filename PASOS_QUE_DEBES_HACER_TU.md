# Lo que debes hacer tú (no se puede automatizar)

Solo estos pasos requieren tu cuenta y tu teclado. El resto del código ya está listo.

---

## 1. Notificaciones por email (elegir una opción)

**Objetivo:** Recibir un email en magaribyelena@gmail.com cuando alguien solicite ser vendor (y, en el futuro, cuando haya una compra).

- **Si no puedes usar más plantillas de EmailJS:** usa la opción sin EmailJS. Todo está explicado en **`NOTIFICACIONES_SIN_EMAILJS.md`** (Zapier/Make o Resend + Edge Function). No hace falta tocar EmailJS.
- **Si quieres seguir con EmailJS** (y tienes una plantilla disponible), sigue los pasos de abajo.

### 1a. EmailJS (opcional)

**Objetivo:** Que los formularios envíen email a magaribyelena@gmail.com y a clientes/solicitantes.

1. Entra en **https://www.emailjs.com/** e inicia sesión (o crea cuenta gratis).
2. **Email Services** → **Add New Service** → elige **Gmail** y conecta la cuenta desde la que quieres enviar (ej. magaribyelena@gmail.com). **Copia el SERVICE_ID** (ej. `service_xxxxx`).
3. **Email Templates** → **Create New Template**. Configura:
   - **To:** `{{to_email}}`
   - **Subject:** `{{subject}}`
   - **Content / Body:** `{{message}}`
   Guarda y **copia el TEMPLATE_ID** (ej. `template_xxxxx`).
4. **Account** → **General** → en API Keys **copia la Public Key**.
5. Abre el archivo **`.env`** en la raíz del proyecto. Verás tres líneas vacías al final. Rellena así (pega tus valores):
   ```env
   VITE_EMAILJS_SERVICE_ID=service_xxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
   ```
6. Guarda `.env` y **reinicia el servidor** (parar con Ctrl+C y volver a ejecutar `npm run dev`).

**Comprobar:** En la consola del navegador (F12) deberías ver: *"EmailJS configurado. Los correos se enviarán a magaribyelena@gmail.com..."*

### 1b. Email al vendor cuando se aprueba o rechaza su solicitud

Cuando el admin aprueba o rechaza una solicitud en el dashboard, el vendor recibe un email automático:

- **Recomendado:** Usar **Resend** con la Edge Function `send-vendor-email`. En **`supabase/README.md`** (sección 5) tienes los pasos: crear cuenta en Resend, añadir `RESEND_API_KEY` en Supabase Secrets y desplegar la función con `npx supabase functions deploy send-vendor-email`.
- **Alternativa:** Si tienes EmailJS configurado en `.env`, la app lo usará como respaldo si la Edge Function no está desplegada o falla.

### 1c. Alternativa sin EmailJS (notificaciones a ti cuando hay solicitud de vendor)

Si no puedes crear o editar plantillas en EmailJS, en **`NOTIFICACIONES_SIN_EMAILJS.md`** tienes dos alternativas para que te llegue un email cada vez que haya una solicitud de vendor (y luego compras):

- **Zapier o Make.com:** webhook de Supabase → ellos te envían el email. Sin código.
- **Resend + Edge Function:** webhook llama a una función que envía el email con Resend. Código ya está en `supabase/functions/notify-magari/`.

---

## 2. Supabase – ejecutar las migraciones (tablas en la base de datos)

**Objetivo:** Que productos y solicitudes de vendors se guarden en tu proyecto de Supabase.

1. Entra en **https://supabase.com/dashboard** y abre tu proyecto.
2. Menú **SQL Editor** → **New query**.
3. Abre en tu ordenador el archivo **`supabase/migrations/20260128000000_create_products.sql`**, copia **todo** el contenido y pégalo en el editor de Supabase. Pulsa **Run**. Debe terminar sin errores.
4. **New query** de nuevo. Abre **`supabase/migrations/20260128100000_create_vendor_applications_and_vendors.sql`**, copia todo, pega en el editor y **Run**. Debe terminar sin errores.

Con eso ya existen las tablas `products`, `vendor_applications` y `vendors`. No hace falta repetir estos pasos.

---

## Resumen

| Qué | Dónde | Acción |
|-----|--------|--------|
| **EmailJS** | .env + cuenta emailjs.com | Rellenar SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY y reiniciar `npm run dev`. |
| **Supabase** | Dashboard → SQL Editor | Ejecutar los dos archivos `.sql` de `supabase/migrations/` (una vez cada uno). |

Cuando hayas hecho 1 y 2, los correos llegarán a magaribyelena@gmail.com y los datos se guardarán en Supabase. Si algo falla, revisa la consola del navegador y el panel de EmailJS/Supabase.
