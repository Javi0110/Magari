# Configuración de Emails con EmailJS

Este proyecto usa EmailJS para enviar emails de confirmación directamente desde el frontend, sin necesidad de un backend.

## 📧 Pasos para Configurar EmailJS

### 1. Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite hasta 200 emails/mes)
3. Confirma tu email

### 2. Crear un Email Service

1. En el dashboard, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Elige tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Guarda el SERVICE_ID** que se muestra

### 3. Crear Email Template

1. Ve a **Email Templates**
2. Haz clic en **Create New Template**
3. Usa este template de ejemplo:

```
Subject: {{subject}}

{{message}}

---

From: {{from_name}}
Email: {{from_email}}
```

**Variables disponibles:**
- `{{subject}}` - Asunto del email
- `{{message}}` - Cuerpo del mensaje
- `{{to_email}}` - Email del destinatario
- `{{from_name}}` - Nombre del remitente
- `{{from_email}}` - Email del remitente
- `{{reference}}` - Número de referencia
- `{{customer_name}}` - Nombre del cliente

4. **Guarda el TEMPLATE_ID** que se muestra

### 4. Obtener Public Key

1. Ve a **Account** > **General**
2. Busca **Public Key** en la sección API Keys
3. **Copia el PUBLIC_KEY**

### 5. Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env` (si no existe)
2. Agrega las siguientes variables:

```env
VITE_EMAILJS_SERVICE_ID=tu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=tu_template_id_aqui
VITE_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
```

3. Reemplaza los valores con los IDs que obtuviste en los pasos anteriores

### 6. Reiniciar el Servidor de Desarrollo

Después de configurar las variables de entorno, reinicia el servidor:

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

## ✅ Verificación

1. Envía un formulario de prueba (servicio o contacto)
2. Revisa tu email `magaribyelena@gmail.com` - deberías recibir una notificación
3. El cliente también recibirá un email de confirmación

## 🔧 Notas Importantes

- **Email de Magari:** Los emails se envían a `magaribyelena@gmail.com` (configurado en `src/utils/emailService.js`)
- **Límite gratuito:** 200 emails/mes en el plan gratuito de EmailJS
- **Sin configuración:** Si no configuras EmailJS, los formularios seguirán funcionando pero solo guardarán los datos en localStorage

## 🐛 Solución de Problemas

### Los emails no se envían

1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que el servidor se haya reiniciado después de agregar las variables
3. Revisa la consola del navegador para ver errores
4. Verifica que tu cuenta de EmailJS esté activa

### Error: "EmailJS not configured"

Esto significa que las variables de entorno no están configuradas. Los datos se seguirán guardando en localStorage, pero no se enviarán emails.

### Ver logs

Abre la consola del navegador (F12) para ver logs de depuración cuando se envían emails.

