# Notificaciones sin EmailJS (vendor applications y compras)

Para enterarte cada vez que alguien solicite ser vendor o haga una compra, puedes usar **una** de estas opciones. No hace falta tocar las plantillas de EmailJS.

---

## Opción 1: Zapier o Make.com (ya integrado en el proyecto)

El proyecto ya tiene un **trigger en Supabase** que, al insertar una solicitud de vendor, hace POST a la URL que tú guardes. Solo tienes que ejecutar la migración, crear el Zap y pegar la URL en el Admin.

### Paso 1 – Migración en Supabase (solo una vez)

1. En [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **Database** → **Extensions**: activa **pg_net** si no está.
2. **SQL Editor** → **New query** → pega el contenido de **`supabase/migrations/20260128300000_zapier_webhook_trigger.sql`** → **Run**.

Así, cada insert en `vendor_applications` enviará un POST a la URL que guardes en el Admin.

### Paso 2 – Crear el Zap en Zapier

1. [zapier.com](https://zapier.com) → **Create Zap** → **Trigger:** **Webhooks by Zapier** → **Catch Hook**. Copia la URL que te den.
2. **Action:** **Email by Zapier** → **To:** `magaribyelena@gmail.com` → **Subject:** `Nueva solicitud vendor: {{record__business_name}}` → **Body:** usa los campos del payload (p. ej. `record__name`, `record__email`, `record__bio`).
3. No actives el Zap todavía.

### Paso 3 – Guardar la URL en el Admin

1. En tu web: **Admin** → **Settings** → sección **Notificaciones (Zapier / Make)**.
2. Pega la URL del Catch Hook y pulsa **Guardar URL**.

### Paso 4 – Probar y activar

1. Envía una solicitud de vendor de prueba desde el Marketplace.
2. En Zapier, **Test trigger**; si ves el payload, activa el Zap.

**Make.com:** trigger Webhooks → Custom webhook (obtienes la URL), la pegas en Admin → Settings, y añades el módulo Email a magaribyelena@gmail.com.

---

## Opción 2: Resend + Edge Function de Supabase (todo en tu proyecto)

Los correos los envía **Resend** (plan gratuito). El contenido del email lo define la Edge Function; no usas plantillas de EmailJS.

### Paso 1 – Resend

1. Entra en [resend.com](https://resend.com) y crea cuenta.
2. **API Keys** → crea una y **cópiala** (empieza por `re_`).
3. (Opcional) En **Domains** verifica tu dominio para que los correos salgan de @tudominio.com. Si no, puedes usar `onboarding@resend.dev` para pruebas.

### Paso 2 – Edge Function en Supabase

1. Instala Supabase CLI si no la tienes:  
   `npm install -g supabase`
2. En la raíz del proyecto (donde está la carpeta `supabase`):  
   `supabase login`  
   `supabase link --project-ref lvzmbghugqnetkosbbpr`
3. Añade el secreto con la API key de Resend:  
   `supabase secrets set RESEND_API_KEY=re_tu_api_key`
4. Despliega la función:  
   `supabase functions deploy notify-magari`

(Opcional) Para que el “from” sea tu dominio verificado:  
`supabase secrets set RESEND_FROM_EMAIL="Magari <notificaciones@tudominio.com>"`

### Paso 3 – Webhook en Supabase

1. Dashboard → **Database** → **Webhooks** → **Create a new hook**.
2. Configura:
   - **Table:** `vendor_applications`
   - **Events:** **Insert**
   - **URL:**  
     `https://lvzmbghugqnetkosbbpr.supabase.co/functions/v1/notify-magari`
   - **HTTP Method:** POST
   - **HTTP Headers:**  
     - Name: `Authorization`  
     - Value: `Bearer TU_SERVICE_ROLE_KEY`  
     (La Service Role Key está en **Project Settings** → **API**.)
3. Guarda.

Cada vez que se inserte una solicitud de vendor, Supabase llamará a la función y esta enviará un email a **magaribyelena@gmail.com** con los datos del formulario (negocio, contacto, email, etc.).

---

## Compras en la web (orders)

Hoy el checkout aún no guarda pedidos en base de datos. Cuando lo tengas (por ejemplo una tabla `orders` en Supabase):

- **Con Zapier/Make:** crea otro webhook en la tabla `orders` (evento Insert) y otro Zap que envíe un email a magaribyelena@gmail.com con los datos del pedido.
- **Con Resend + Edge Function:** en `supabase/functions/notify-magari/index.ts` ya está preparado para, en el futuro, tratar `table === 'orders'` y enviar un email con el resumen de la compra (solo hay que rellenar ese caso con los campos de tu tabla `orders`).

---

## Resumen

| Qué quieres                         | Opción 1 (Zapier/Make)     | Opción 2 (Resend + Edge Function) |
|------------------------------------|----------------------------|-----------------------------------|
| Notificación por cada solicitud vendor | Webhook Supabase → Zapier/Make → Email | Webhook Supabase → notify-magari → Resend → Email |
| Crear/editar plantillas de email    | No (lo haces en el Zap)    | No (el texto está en código)      |
| Límite de plantillas               | No aplica                  | No aplica                         |
| Coste                              | Plan gratuito de Zapier/Make | Plan gratuito de Resend         |

Con cualquiera de las dos opciones te enterarás de cada solicitud de vendor (y luego de cada compra, cuando conectes la tabla `orders`) sin depender de las plantillas de EmailJS.
