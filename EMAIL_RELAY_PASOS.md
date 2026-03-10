# Email relay al vendor (sin EmailJS)

Los correos de aprobación/rechazo al vendor se envían con **Resend** a través de una función en Netlify. No hace falta EmailJS ni Supabase CLI.

---

## Paso 1: Cuenta en Resend

1. Entra en **https://resend.com** y crea una cuenta (gratis).
2. En el dashboard: **API Keys** → **Create API Key** → ponle un nombre (ej. "Magari") y copia la key (empieza por `re_`). Guárdala; no la volverás a ver completa.

---

## Paso 2: Añadir la key en Netlify

1. Entra en **https://app.netlify.com** y abre el sitio de Magari (casamagari.com o el que uses).
2. Menú: **Site configuration** (o **Site settings**) → **Environment variables**.
3. **Add a variable** (o **Add variable** / **New variable**):
   - **Key:** `RESEND_API_KEY`
   - **Value:** la API key que copiaste de Resend.
4. **Save** (o **Create variable**).
5. Si el sitio ya estaba desplegado, haz un **redeploy** para que la función use la nueva variable: **Deploys** → **Trigger deploy** → **Deploy site**.

---

## Paso 3: Desplegar

Cada vez que subas cambios a tu repositorio (git push), Netlify vuelve a desplegar y la función `send-vendor-email` se actualiza. Si acabas de añadir `RESEND_API_KEY`, con un redeploy basta.

---

## Probar en local (opcional)

Si quieres probar el envío desde tu ordenador:

1. Instala Netlify CLI: `npm install -g netlify-cli`
2. En la carpeta del proyecto: `netlify login` y luego `netlify link` (elige tu sitio).
3. Ejecuta `netlify dev` en lugar de `npm run dev`. Así se levantan la app y las funciones.
4. Crea un archivo `.env` en la raíz con `RESEND_API_KEY=re_xxx` para que la función local use la key (o configúrala en Netlify y usa `netlify dev` que puede inyectar las env del sitio).

En producción, con la variable ya configurada en Netlify y el sitio desplegado, cuando apruebes o rechaces una solicitud en el Admin el vendor recibirá el email.
