# Configuración de Emails con EmailJS

Para que los correos lleguen a **magaribyelena@gmail.com** (solicitudes de servicios, contacto, aplicaciones de vendors, aprobaciones y rechazos) y a los clientes/solicitantes, configura EmailJS una sola vez.

## 1. Cuenta y servicio en EmailJS

1. Entra en [https://www.emailjs.com/](https://www.emailjs.com/) y crea una cuenta (plan gratuito: 200 emails/mes).
2. **Email Services** → **Add New Service** → elige **Gmail** (o tu proveedor).
3. Conecta la cuenta desde la que quieres enviar (p. ej. magaribyelena@gmail.com) y **guarda el SERVICE_ID**.

## 2. Plantilla que usa la app

La app envía siempre estas variables: **to_email**, **subject**, **message** (y a veces from_name, etc.). Con una sola plantilla basta.

1. En EmailJS ve a **Email Templates** → **Create New Template**.
2. En la plantilla, configura exactamente:

**To (destinatario):**
```
{{to_email}}
```

**Subject (asunto):**
```
{{subject}}
```

**Content (cuerpo):**
```
{{message}}
```

3. Opcional: en "Settings" de la plantilla puedes activar "Reply-To" y usar `{{from_email}}` si lo quieres para contestar al cliente.
4. **Guarda** y copia el **TEMPLATE_ID** (p. ej. `template_xxxxxx`).

## 3. Public Key

1. **Account** → **General**.
2. En **API Keys** copia la **Public Key**.

## 4. Variables de entorno

En la raíz del proyecto (donde está `package.json`):

1. Si no existe, crea un archivo **`.env`**.
2. Añade estas líneas (sustituye por tus valores reales):

```env
# EmailJS – obligatorio para que lleguen los correos
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

3. Guarda el archivo. **Reinicia el servidor de desarrollo** (`npm run dev`).

## 5. Comprobar que está configurado

- En desarrollo, al cargar la app deberías ver en la consola del navegador:  
  `EmailJS configurado. Los correos se enviarán a magaribyelena@gmail.com...`
- Si no ves ese mensaje, revisa que las tres variables estén en `.env`, que empiecen por `VITE_` y que hayas reiniciado `npm run dev`.

## Resumen

| Variable en `.env`           | Dónde obtenerla              |
|-----------------------------|------------------------------|
| `VITE_EMAILJS_SERVICE_ID`   | Email Services → tu servicio |
| `VITE_EMAILJS_TEMPLATE_ID`  | Email Templates → tu plantilla |
| `VITE_EMAILJS_PUBLIC_KEY`   | Account → API Keys           |

La plantilla debe usar **To: {{to_email}}**, **Subject: {{subject}}**, **Content: {{message}}**. Con eso, todos los envíos (servicios, contacto, vendor application, aprobación y rechazo) funcionan.
