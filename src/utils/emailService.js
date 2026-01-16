import emailjs from '@emailjs/browser'

// Initialize EmailJS with your public key
// Get these values from https://www.emailjs.com/
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
const MAGARI_EMAIL = 'magaribyelena@gmail.com'

// Initialize EmailJS
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

/**
 * Send confirmation email to customer and notification to Magari team
 */
export const sendServiceRequestEmail = async (serviceData) => {
  // Skip if EmailJS is not configured
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Emails will not be sent.')
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

    // Send both emails
    const [magariResult, customerResult] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID, magariEmailParams).catch(err => {
        console.error('Error sending email to Magari team:', err)
        return { success: false, error: err }
      }),
      serviceData.contact?.email 
        ? emailjs.send(SERVICE_ID, TEMPLATE_ID, customerEmailParams).catch(err => {
            console.error('Error sending confirmation email to customer:', err)
            return { success: false, error: err }
          })
        : Promise.resolve({ success: true })
    ])

    return {
      success: magariResult.success !== false && customerResult.success !== false,
      magariSent: magariResult.success !== false,
      customerSent: customerResult.success !== false
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
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Emails will not be sent.')
    console.log('Contact form data:', formData)
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

    const [magariResult, customerResult] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID, magariParams),
      emailjs.send(SERVICE_ID, TEMPLATE_ID, customerParams)
    ])

    return {
      success: true,
      magariSent: magariResult.status === 200,
      customerSent: customerResult.status === 200
    }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: error.message }
  }
}

