import emailjs from '@emailjs/browser'

// EmailJS: https://www.emailjs.com/ — Variables en .env: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
const SERVICE_ID = (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim()
const TEMPLATE_ID = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim()
const PUBLIC_KEY = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim()
const MAGARI_EMAIL = 'magaribyelena@gmail.com'

const isEmailJSConfigured = () => !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}
if (import.meta.env.DEV && isEmailJSConfigured()) {
  console.info('EmailJS configurado. Los correos se enviarán a', MAGARI_EMAIL, 'y a los destinatarios indicados.')
}

/**
 * Send confirmation email to customer and notification to Magari team
 */
export const sendServiceRequestEmail = async (serviceData) => {
  // Skip if EmailJS is not configured
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS no configurado. Añade VITE_EMAILJS_* en .env (ver EMAIL_SETUP.md)')
    console.log('Service request data:', serviceData)
    return { success: false, error: 'EmailJS not configured' }
  }

  try {
    // Format service details for email
    const areasList = serviceData.areas?.map(area => {
      const entries = area.entries?.map(entry => 
        `• ${entry.name || entry.nickname || 'Entry'}: ${entry.stylePreference || 'N/A'} style, ${entry.budgetRange || 'N/A'} budget`
      ).join('\n') || '• No entries'
      return `\n${area.label}:\n${entries}`
    }).join('\n\n') || 'No areas selected'

    const emailBody = `
Nueva solicitud de servicio: ${serviceData.service}

Referencia: ${serviceData.reference}

INFORMACIÓN DE CONTACTO:
• Nombre: ${serviceData.contact?.fullName || serviceData.contact?.name || 'N/A'}
• Email: ${serviceData.contact?.email || 'N/A'}
• Teléfono: ${serviceData.contact?.phone || 'N/A'}
• Dirección: ${serviceData.contact?.address || 'N/A'}

ÁREAS Y ESPACIOS:
${areasList}

DETALLES DEL SERVICIO:
• Subtotal: $${serviceData.subtotal?.toLocaleString() || '0'}
• Depósito: $${serviceData.deposit?.toLocaleString() || '0'}
${serviceData.timeline ? `• Timeline: ${serviceData.timeline}` : ''}
${serviceData.schedule?.date ? `• Cita programada: ${serviceData.schedule.date} ${serviceData.schedule.time || ''}` : ''}
${serviceData.serviceMode ? `• Modo de servicio: ${serviceData.serviceMode}` : ''}
${serviceData.installDays ? `• Días de instalación: ${serviceData.installDays}` : ''}

${serviceData.visit ? `
VISITA:
${serviceData.visit.date ? `• Fecha: ${serviceData.visit.date}` : ''}
${serviceData.visit.time ? `• Hora: ${serviceData.visit.time}` : ''}
${serviceData.visit.fee ? `• Tarifa: $${serviceData.visit.fee}` : ''}
${serviceData.visit.note ? `• Notas: ${serviceData.visit.note}` : ''}
` : ''}

Por favor, contacta al cliente lo antes posible para confirmar los detalles.

---
Este es un email automático generado desde el formulario de servicios de Magari & Co.
    `.trim()

    // Send email to Magari team
    const magariEmailParams = {
      to_email: MAGARI_EMAIL,
      from_name: 'Magari & Co. Website',
      subject: `Nueva Solicitud de ${serviceData.service} - ${serviceData.reference}`,
      message: emailBody,
      customer_name: serviceData.contact?.fullName || serviceData.contact?.name || 'Cliente',
      customer_email: serviceData.contact?.email || '',
      reference: serviceData.reference
    }

    // Send confirmation email to customer
    const customerEmailParams = {
      to_email: serviceData.contact?.email || '',
      from_name: 'Magari & Co.',
      subject: `Confirmación de Solicitud - ${serviceData.reference}`,
      message: `
Hola ${serviceData.contact?.fullName || serviceData.contact?.name || 'Estimado/a cliente'},

¡Gracias por confiar en Magari & Co.!

Hemos recibido tu solicitud de ${serviceData.service} con la siguiente información:

Referencia: ${serviceData.reference}

Detalles de tu solicitud:
${serviceData.areas?.length ? `• ${serviceData.areas.length} espacio(s) seleccionado(s)` : ''}
• Subtotal: $${serviceData.subtotal?.toLocaleString() || '0'}
• Depósito: $${serviceData.deposit?.toLocaleString() || '0'}

Próximos pasos:
1. Revisaremos tu solicitud y nos pondremos en contacto contigo dentro de 24-48 horas.
2. Coordinaremos los detalles del proyecto.
3. Una vez confirmados todos los detalles, procederemos con el depósito.

Si tienes alguna pregunta, no dudes en contactarnos:
• Email: ${MAGARI_EMAIL}
• Instagram: @magariandco

¡Estamos emocionados de trabajar contigo!

Con cariño,
El equipo de Magari & Co.
      `.trim(),
      reference: serviceData.reference
    }

    const ok = (r) => r && r.status === 200
    const [magariResult, customerResult] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID, magariEmailParams).catch(err => {
        console.error('Error sending email to Magari team:', err)
        return null
      }),
      serviceData.contact?.email
        ? emailjs.send(SERVICE_ID, TEMPLATE_ID, customerEmailParams).catch(err => {
            console.error('Error sending confirmation email to customer:', err)
            return null
          })
        : Promise.resolve({ status: 200 })
    ])

    return {
      success: ok(magariResult) && ok(customerResult),
      magariSent: ok(magariResult),
      customerSent: ok(customerResult)
    }
  } catch (error) {
    console.error('Error sending service request email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send contact form email
 */
export const sendContactFormEmail = async (formData) => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS no configurado. Ver EMAIL_SETUP.md')
    return { success: false, error: 'EmailJS not configured' }
  }

  try {
    const emailBody = `
Nuevo mensaje del formulario de contacto:

De: ${formData.name}
Email: ${formData.email}
Asunto: ${formData.subject || 'Sin asunto'}

Mensaje:
${formData.message}

---
Este es un email automático generado desde el formulario de contacto de Magari & Co.
    `.trim()

    // Send to Magari team
    const magariParams = {
      to_email: MAGARI_EMAIL,
      from_name: formData.name,
      from_email: formData.email,
      subject: `Formulario de Contacto: ${formData.subject || 'Nuevo mensaje'}`,
      message: emailBody
    }

    // Send confirmation to customer
    const customerParams = {
      to_email: formData.email,
      from_name: 'Magari & Co.',
      subject: 'Gracias por contactarnos - Magari & Co.',
      message: `
Hola ${formData.name},

¡Gracias por contactarnos!

Hemos recibido tu mensaje y te responderemos lo antes posible, generalmente dentro de 24-48 horas.

Tu mensaje:
"${formData.message}"

Si tienes alguna pregunta urgente, puedes contactarnos directamente en:
• Email: ${MAGARI_EMAIL}
• Instagram: @magariandco

¡Esperamos hablar contigo pronto!

Con cariño,
El equipo de Magari & Co.
      `.trim()
    }

    const ok = (r) => r && r.status === 200
    const [magariResult, customerResult] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID, magariParams).catch(err => {
        console.error('Error sending contact email to Magari:', err)
        return null
      }),
      emailjs.send(SERVICE_ID, TEMPLATE_ID, customerParams).catch(err => {
        console.error('Error sending confirmation to customer:', err)
        return null
      })
    ])

    return {
      success: ok(magariResult) && ok(customerResult),
      magariSent: ok(magariResult),
      customerSent: ok(customerResult)
    }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send vendor application email to Magari team and confirmation to applicant
 */
export const sendVendorApplicationEmail = async (applicationData) => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS no configurado. No llegará email a magaribyelena@gmail.com. Ver EMAIL_SETUP.md')
    console.log('Vendor application data:', applicationData)
    return { success: false, error: 'EmailJS not configured' }
  }

  try {
    const imageCount = applicationData.sampleImages?.length || 0
    const categoriesList = applicationData.categories?.join(', ') || 'N/A'
    
    const emailBody = `
Nueva solicitud de vendor para el marketplace

INFORMACIÓN DE CONTACTO:
• Nombre: ${applicationData.name || 'N/A'}
• Nombre del negocio: ${applicationData.businessName || 'N/A'}
• Email: ${applicationData.email || 'N/A'}
• Teléfono: ${applicationData.phone || 'N/A'}
• Instagram: ${applicationData.instagram || 'N/A'}

INFORMACIÓN DEL NEGOCIO:
• Categorías: ${categoriesList}
• Bio: ${applicationData.bio || 'N/A'}
• Imágenes de muestra: ${imageCount} imagen${imageCount !== 1 ? 'es' : ''}

INFORMACIÓN DE PAGO:
• Método de pago: ${applicationData.payoutMethod || 'N/A'}
• Email/cuenta de pago: ${applicationData.payoutEmail || 'N/A'}

Fecha de solicitud: ${applicationData.submittedAt ? new Date(applicationData.submittedAt).toLocaleString('es-PR') : new Date().toLocaleString('es-PR')}

Por favor, revisa la solicitud y contacta al solicitante lo antes posible.

---
Este es un email automático generado desde el formulario de aplicación de vendor de Magari & Co.
    `.trim()

    // Send email to Magari team
    const magariEmailParams = {
      to_email: MAGARI_EMAIL,
      from_name: 'Magari & Co. Website',
      subject: `Nueva Solicitud de Vendor - ${applicationData.businessName || applicationData.name}`,
      message: emailBody,
      applicant_name: applicationData.name || 'Solicitante',
      applicant_email: applicationData.email || '',
      business_name: applicationData.businessName || 'N/A'
    }

    // Send confirmation email to applicant
    const applicantEmailParams = {
      to_email: applicationData.email || '',
      from_name: 'Magari & Co.',
      subject: 'Confirmación de Solicitud de Vendor - Magari & Co.',
      message: `
Hola ${applicationData.name || 'Estimado/a solicitante'},

¡Gracias por tu interés en unirte al marketplace de Magari & Co.!

Hemos recibido tu solicitud para convertirte en vendor con la siguiente información:

• Nombre del negocio: ${applicationData.businessName || 'N/A'}
• Email: ${applicationData.email || 'N/A'}
• Categorías: ${categoriesList}
• Imágenes de muestra: ${imageCount} imagen${imageCount !== 1 ? 'es' : ''}

Próximos pasos:
1. Revisaremos tu solicitud y las imágenes que compartiste.
2. Nos pondremos en contacto contigo dentro de 3-5 días hábiles.
3. Si tu solicitud es aprobada, recibirás instrucciones para configurar tu cuenta de vendor.

¿Qué sigue?
- Si necesitas más información sobre el proceso, puedes visitar nuestra página de marketplace.
- Para preguntas urgentes, contáctanos en: ${MAGARI_EMAIL}

Esperamos trabajar contigo pronto.

Con cariño,
El equipo de Magari & Co.
      `.trim()
    }

    const ok = (r) => r && r.status === 200
    const [magariResult, applicantResult] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID, magariEmailParams).catch(err => {
        console.error('Error sending vendor application email to Magari:', err)
        return null
      }),
      applicationData.email
        ? emailjs.send(SERVICE_ID, TEMPLATE_ID, applicantEmailParams).catch(err => {
            console.error('Error sending confirmation to applicant:', err)
            return null
          })
        : Promise.resolve({ status: 200 })
    ])

    return {
      success: ok(magariResult) && ok(applicantResult),
      magariSent: ok(magariResult),
      applicantSent: ok(applicantResult)
    }
  } catch (error) {
    console.error('Error sending vendor application email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send approval email to applicant with login credentials
 */
export const sendVendorApprovalEmail = async ({ email, name, businessName, accessCode, loginUrl = 'https://casamagari.com/marketplace' }) => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS no configurado.')
    return { success: false, error: 'EmailJS not configured' }
  }
  try {
    const message = `
¡Felicidades, ${name}!

Tu solicitud para vender en el MOMade Marketplace de Magari & Co. ha sido aprobada.

Ya puedes acceder a tu tienda y comenzar a añadir productos, logo e información.

TUS CREDENCIALES DE ACCESO:
• Email: ${email}
• Código de acceso: ${accessCode}
• Enlace para entrar: ${loginUrl}

INSTRUCCIONES:
1. Ve a ${loginUrl}
2. Haz clic en "Vendor Login" o "Iniciar sesión"
3. Introduce tu email y el código de acceso de arriba
4. Desde tu panel podrás: añadir productos, subir tu logo y completar la información de tu tienda

Guarda este email en un lugar seguro. Si pierdes tu código de acceso, contáctanos en ${MAGARI_EMAIL}.

¡Bienvenida al marketplace!

Con cariño,
El equipo de Magari & Co.
    `.trim()
    const params = {
      to_email: email,
      from_name: 'Magari & Co.',
      subject: '¡Aprobada! Tu cuenta de vendor MOMade está lista',
      message
    }
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
    return { success: res && res.status === 200 }
  } catch (error) {
    console.error('Error sending vendor approval email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send rejection email to applicant
 */
export const sendVendorRejectionEmail = async ({ email, name, businessName }) => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS no configurado.')
    return { success: false, error: 'EmailJS not configured' }
  }
  try {
    const message = `
Hola ${name},

Gracias por tu interés en unirte al MOMade Marketplace de Magari & Co.

Después de revisar tu solicitud para ${businessName || 'tu negocio'}, en este momento no podemos aprobar tu cuenta. Esto puede deberse a criterios de selección o capacidad del marketplace.

Si tienes preguntas o quieres más información, no dudes en contactarnos en ${MAGARI_EMAIL}.

Te deseamos mucho éxito con tu emprendimiento.

Con cariño,
El equipo de Magari & Co.
    `.trim()
    const params = {
      to_email: email,
      from_name: 'Magari & Co.',
      subject: 'Actualización de tu solicitud MOMade Marketplace',
      message
    }
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
    return { success: res && res.status === 200 }
  } catch (error) {
    console.error('Error sending vendor rejection email:', error)
    return { success: false, error: error.message }
  }
}

export { isEmailJSConfigured }

