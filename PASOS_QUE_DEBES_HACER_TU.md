# Lo que debes hacer tú (no se puede automatizar)

Solo estos pasos requieren tu cuenta y tu teclado. El resto del código ya está listo.

---

## 1. Notificaciones por email (Resend + Netlify)

**Objetivo:** Que contacto, lead magnet, solicitud vendor y confirmaciones lleguen a **magaribyelena@gmail.com** (y copia al cliente cuando aplica).

1. Cuenta en **[resend.com](https://resend.com)** y API key (`re_...`).
2. En **Netlify** → tu sitio → **Environment variables**: `RESEND_API_KEY` (y opcional `RESEND_FROM_EMAIL`).
3. Despliega el sitio (las funciones `send-magari-mail` y `send-vendor-email` ya están en `netlify/functions/`).

Pasos detallados y pruebas en local: **`EMAIL_SETUP.md`**. Aprobación/rechazo vendor (mismo Resend): **`EMAIL_RELAY_PASOS.md`**.

Opcional — avisos solo por webhook sin tocar el relay del sitio: **`NOTIFICACIONES_SIN_EMAILJS.md`** (Zapier/Make o Edge Function `notify-magari`).

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
| **Correos (Resend + Netlify)** | Netlify env vars + Resend | Ver **`EMAIL_SETUP.md`**. |
| **Supabase** | Dashboard → SQL Editor | Ejecutar los dos archivos `.sql` de `supabase/migrations/` (una vez cada uno). |

Cuando hayas hecho 1 y 2, los correos salen por las funciones Netlify y los datos se guardan en Supabase. Si algo falla, revisa la consola del navegador (F12), logs de **Netlify → Functions** y el panel de Supabase.
