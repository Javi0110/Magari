/**
 * Relay unificado: contacto, vendor application, lead magnet, service request.
 * Resend (plan gratuito). Netlify: RESEND_API_KEY (+ opcional RESEND_FROM_EMAIL).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Magari <onboarding@resend.dev>'
const MAGARI_EMAIL = 'magaribyelena@gmail.com'
const CHECKLIST_PDF_URL = 'https://casamagari.com/home-prep-checklist.pdf'

function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendResend(to, subject, html) {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not set in Netlify' }
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
    const t = await res.text()
    return { ok: false, error: `${res.status} ${t}` }
  }
  return { ok: true }
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { kind } = body
  if (!kind) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing kind' }) }
  }

  try {
    if (kind === 'contact') {
      const { name, email, subject: subj, message } = body
      if (!email || !message) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing email or message' }) }
      }
      const internalHtml = `<p><strong>Contacto web</strong></p>
<p>De: ${escapeHtml(name)}<br/>Email: ${escapeHtml(email)}<br/>Asunto: ${escapeHtml(subj || '—')}</p>
<p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`
      const r1 = await sendResend(MAGARI_EMAIL, `Contacto: ${subj || 'Nuevo mensaje'}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const replyHtml = `<p>Hola ${escapeHtml(name)},</p>
<p>Gracias por escribirnos. Hemos recibido tu mensaje y te responderemos lo antes posible (24–48 h hábiles).</p>
<p><em>Tu mensaje:</em><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
<p>— Magari &amp; Co.<br/><a href="mailto:${MAGARI_EMAIL}">${MAGARI_EMAIL}</a></p>`
      const r2 = await sendResend(email, 'Gracias por contactar a Magari & Co.', replyHtml)
      if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    if (kind === 'lead_magnet') {
      const { name, email, phone, serviceInterest, source } = body
      if (!email || !name) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing name or email' }) }
      }
      const internalHtml = `<p><strong>${escapeHtml(source || 'Lead magnet')}</strong></p>
<ul>
<li>Nombre: ${escapeHtml(name)}</li>
<li>Email: ${escapeHtml(email)}</li>
<li>Teléfono: ${escapeHtml(phone || '—')}</li>
<li>Interés: ${escapeHtml(serviceInterest || '—')}</li>
</ul>
<p>PDF: <a href="${CHECKLIST_PDF_URL}">${CHECKLIST_PDF_URL}</a></p>`
      const r1 = await sendResend(MAGARI_EMAIL, `Home Prep Checklist — ${name}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const replyHtml = `<p>Hola ${escapeHtml(name)},</p>
<p>Gracias por solicitar el <strong>Home Prep Checklist</strong>. Descarga el PDF aquí:</p>
<p><a href="${CHECKLIST_PDF_URL}">${CHECKLIST_PDF_URL}</a></p>
<p>Si el enlace no abre, responde a este correo y te lo enviamos adjunto.</p>
<p>Reservar consulta: <a href="https://casamagari.com/contact#book">casamagari.com/contact</a></p>
<p>— Magari &amp; Co.</p>`
      const r2 = await sendResend(email, 'Tu checklist — Magari & Co.', replyHtml)
      if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    if (kind === 'vendor_application') {
      const a = body.applicationData || body
      const categoriesList = (a.categories || []).join(', ') || 'N/A'
      const imageCount = a.sampleImages?.length || 0
      const internalHtml = `<p><strong>Nueva solicitud vendor MOMade</strong></p>
<ul>
<li>Nombre: ${escapeHtml(a.name)}</li>
<li>Negocio: ${escapeHtml(a.businessName)}</li>
<li>Email: ${escapeHtml(a.email)}</li>
<li>Tel: ${escapeHtml(a.phone || '—')}</li>
<li>IG: ${escapeHtml(a.instagram || '—')}</li>
<li>Categorías: ${escapeHtml(categoriesList)}</li>
<li>Bio: ${escapeHtml(a.bio || '—')}</li>
<li>Imágenes muestra: ${imageCount}</li>
<li>Pago: ${escapeHtml(a.payoutMethod || '—')} / ${escapeHtml(a.payoutEmail || '—')}</li>
</ul>`
      const r1 = await sendResend(
        MAGARI_EMAIL,
        `Vendor: ${a.businessName || a.name || 'solicitud'}`,
        internalHtml
      )
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const replyHtml = `<p>Hola ${escapeHtml(a.name)},</p>
<p>Hemos recibido tu solicitud para el MOMade Marketplace. Revisaremos tu perfil y te contactamos en 3–5 días hábiles.</p>
<p>— Magari &amp; Co.</p>`
      const r2 = await sendResend(a.email, 'Solicitud recibida — MOMade / Magari & Co.', replyHtml)
      if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    if (kind === 'service_request') {
      const s = body.serviceData || body
      const lines = [
        `Servicio: ${escapeHtml(s.service)}`,
        `Ref: ${escapeHtml(s.reference)}`,
        `Contacto: ${escapeHtml(s.contact?.fullName || s.contact?.name)} / ${escapeHtml(s.contact?.email)}`,
        `Tel: ${escapeHtml(s.contact?.phone || '—')}`,
        `Subtotal: $${s.subtotal ?? '0'} · Depósito: $${s.deposit ?? '0'}`,
      ]
      const internalHtml = `<p><strong>Solicitud de servicio</strong></p><p>${lines.join('<br/>')}</p>`
      const r1 = await sendResend(MAGARI_EMAIL, `Servicio: ${s.service} — ${s.reference}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const em = s.contact?.email
      if (em) {
        const replyHtml = `<p>Hola ${escapeHtml(s.contact?.fullName || s.contact?.name || 'hola')},</p>
<p>Hemos recibido tu solicitud <strong>${escapeHtml(s.reference)}</strong>. Te contactamos en 24–48 h.</p>
<p>— Magari &amp; Co.</p>`
        const r2 = await sendResend(em, `Confirmación — ${s.reference}`, replyHtml)
        if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Unknown kind' }) }
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err.message || 'Server error' }),
    }
  }
}
