# Correos: Resend + Netlify (sin EmailJS)

Los formularios del sitio (contacto, lead magnet / checklist, solicitud vendor) envían correo a **magaribyelena@gmail.com** y copia al cliente cuando aplica, usando **Resend** (plan gratuito) desde una **Netlify Function**: `send-magari-mail`.

Los correos de **aprobación/rechazo de vendor** siguen usando la función **`send-vendor-email`** (mismo stack: Resend en Netlify). Opcionalmente la app intenta antes la Edge Function de Supabase.

---

## 1. Resend

1. Cuenta en [resend.com](https://resend.com) → **API Keys** → crea una (`re_...`).
2. (Recomendado) Verifica tu dominio en **Domains** y define un remitente tipo `Magari <hola@tudominio.com>`.

---

## 2. Variables en Netlify

En el sitio → **Site configuration** → **Environment variables**:

| Variable | Descripción |
|----------|-------------|
| `RESEND_API_KEY` | API key de Resend (**obligatoria**). |
| `RESEND_FROM_EMAIL` | Opcional. Ej. `Magari <onboarding@resend.dev>` o tu dominio verificado. Si no existe, la función usa `Magari <onboarding@resend.dev>`. |

**Redeploy** tras guardar variables.

---

## 3. Desarrollo local (`npm run dev`)

Las funciones no existen en `localhost:5173`. Opciones:

- **A)** En `.env` (raíz del proyecto):

  ```env
  VITE_EMAIL_RELAY_URL=https://casamagari.com/.netlify/functions/send-magari-mail
  ```

  (Sustituye por tu dominio Netlify real.)

- **B)** Ejecutar **`netlify dev`** en lugar de `npm run dev` para levantar Vite + funciones.

Para emails de aprobación vendor, la app usa la misma lógica: en producción `https://TU-DOMINIO/.netlify/functions/send-vendor-email`, o variable opcional:

```env
VITE_VENDOR_EMAIL_RELAY_URL=https://casamagari.com/.netlify/functions/send-vendor-email
```

---

## 4. Comprobar

1. Despliega en Netlify con `RESEND_API_KEY` configurada.
2. Envía el formulario de contacto o el lead magnet.
3. Revisa la bandeja de **magaribyelena@gmail.com** y la del remitente de prueba.

Si falla, en el navegador (F12) → **Network** mira la respuesta del `POST` a `send-magari-mail`; en Netlify → **Functions** → logs.

---

Más detalle solo para aprobación/rechazo vendor: **`EMAIL_RELAY_PASOS.md`**.
