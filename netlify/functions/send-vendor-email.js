/**
 * Netlify Function: email relay para aprobación/rechazo de vendors.
 * Envía el correo vía Resend. Variable de entorno en Netlify: RESEND_API_KEY
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Magari <onboarding@resend.dev>'
const MAGARI_EMAIL = 'magaribyelena@gmail.com'

function escapeHtml(s) {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildApprovalHtml({ name, email, accessCode, loginUrl }) {
  const url = loginUrl || 'https://casamagari.com/marketplace'
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4a7c59;">¡Felicidades, ${escapeHtml(name)}!</h2>
  <p>Tu solicitud para vender en el MOMade Marketplace de Magari &amp; Co. ha sido aprobada.</p>
  <p>Ya puedes acceder a tu tienda y comenzar a añadir productos, logo e información.</p>
  <p><strong>TUS CREDENCIALES DE ACCESO:</strong></p>
  <ul>
    <li>Email: ${escapeHtml(email)}</li>
    <li>Código de acceso: <strong>${escapeHtml(accessCode)}</strong></li>
    <li>Enlace: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>
  </ul>
  <p>Ve a ese enlace, haz clic en "Vendor Login" e introduce tu email y el código de acceso. Guarda este correo en un lugar seguro.</p>
  <p>Si pierdes tu código, contáctanos en ${MAGARI_EMAIL}.</p>
  <p>¡Bienvenida al marketplace!</p>
  <p>— El equipo de Magari &amp; Co.</p>
</body></html>`.trim()
}

function buildRejectionHtml({ name, businessName }) {
  const business = businessName || 'tu negocio'
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <p>Hola ${escapeHtml(name)},</p>
  <p>Gracias por tu interés en unirte al MOMade Marketplace de Magari &amp; Co.</p>
  <p>Después de revisar tu solicitud para ${escapeHtml(business)}, en este momento no podemos aprobar tu cuenta. Si tienes preguntas, contáctanos en ${MAGARI_EMAIL}.</p>
  <p>Te deseamos mucho éxito con tu emprendimiento.</p>
  <p>— El equipo de Magari &amp; Co.</p>
</body></html>`.trim()
}

async function sendResend(to, subject, html) {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not set' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    return { ok: false, error: `${res.status} ${err}` }
  }
  return { ok: true }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }
  const { type, email, name, businessName, accessCode, loginUrl } = body
  if (!type || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing type or email' }) }
  }
  let subject, html
  if (type === 'approval') {
    if (!accessCode) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing accessCode for approval' }) }
    }
    subject = '¡Aprobada! Tu cuenta de vendor MOMade está lista'
    html = buildApprovalHtml({ name: name || 'Vendor', email, accessCode, loginUrl })
  } else if (type === 'rejection') {
    subject = 'Actualización de tu solicitud MOMade Marketplace'
    html = buildRejectionHtml({ name: name || 'Vendor', businessName })
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid type' }) }
  }
  const result = await sendResend(email, subject, html)
  if (!result.ok) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: result.error }) }
  }
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
}
