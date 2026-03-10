// Netlify Function: send service request confirmation emails via Resend only
// Called when a customer submits Virtual Styling, Shopping & Styling, or Decorating + Installation

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Magari & Co. <hello@casamagari.com>'
const MAGARI_EMAIL = 'magaribyelena@gmail.com'

function escapeHtml(s) {
  if (s == null || s === '') return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildAreasList(areas) {
  if (!Array.isArray(areas) || areas.length === 0) return '<p>No areas selected.</p>'
  let html = ''
  for (const area of areas) {
    const label = escapeHtml(area.label || area.id || 'Space')
    const entries = area.entries || []
    html += `<p><strong>${label}</strong></p><ul style="margin:0 0 1em 1.2em;">`
    for (const entry of entries) {
      const name = escapeHtml(entry.name || entry.nickname || '—')
      const style = escapeHtml(entry.stylePreference || '—')
      const budget = escapeHtml(entry.budgetRange || '—')
      const keep = entry.keepNotes ? escapeHtml(entry.keepNotes) : ''
      const remove = entry.removeNotes ? escapeHtml(entry.removeNotes) : ''
      const unsure = entry.unsureNotes ? escapeHtml(entry.unsureNotes) : ''
      const mediaCount = Array.isArray(entry.media) ? entry.media.length : 0
      html += `<li>${name} — Style: ${style}, Budget: ${budget}`
      if (mediaCount) html += ` (${mediaCount} photo(s) in dashboard)`
      html += '</li>'
      if (keep) html += `<li><em>Keep:</em> ${keep}</li>`
      if (remove) html += `<li><em>Remove:</em> ${remove}</li>`
      if (unsure) html += `<li><em>Unsure:</em> ${unsure}</li>`
    }
    html += '</ul>'
  }
  return html || '<p>No details.</p>'
}

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return { ok: false, error: 'Missing RESEND_API_KEY' }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: JSON.stringify(data) || res.statusText }
  }
  return { ok: true }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const payload = JSON.parse(event.body || '{}')
    const service = payload.service || 'Design Service'
    const reference = payload.reference || ''
    const contact = payload.contact || {}
    const customerName = contact.fullName || contact.name || 'Client'
    const customerEmail = (contact.email || '').trim()
    const subtotal = Number(payload.subtotal) || 0
    const deposit = Number(payload.deposit) || 0
    const areas = payload.areas || []
    const areasHtml = buildAreasList(areas)

    const timeline = payload.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(payload.timeline)}</p>` : ''
    const schedule = payload.schedule
      ? `<p><strong>Kickoff:</strong> ${escapeHtml(payload.schedule.date || '')} ${escapeHtml(payload.schedule.time || '')}</p>`
      : ''
    const serviceMode = payload.serviceMode ? `<p><strong>Service mode:</strong> ${escapeHtml(payload.serviceMode)}</p>` : ''
    const measurementVisit = payload.measurementVisit ? '<p><strong>Measurement visit:</strong> Yes (+$75)</p>' : ''
    const installDays = payload.installDays != null ? `<p><strong>Install days:</strong> ${payload.installDays}</p>` : ''
    const desiredDate = payload.desiredDate ? `<p><strong>Desired completion:</strong> ${escapeHtml(payload.desiredDate)}</p>` : ''
    const deliveryOption = payload.deliveryOption ? `<p><strong>Delivery:</strong> ${escapeHtml(payload.deliveryOption)}</p>` : ''
    const purchaseMethod = payload.purchaseMethod ? `<p><strong>Purchase:</strong> ${escapeHtml(payload.purchaseMethod)}</p>` : ''
    const visit = payload.visit
      ? `<p><strong>Visit:</strong> ${payload.visit.date || '—'} ${payload.visit.time || ''} ${payload.visit.note ? escapeHtml(payload.visit.note) : ''} ${payload.visit.fee ? `($${payload.visit.fee})` : ''}</p>`
      : ''

    // Email to customer
    const customerHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p>Hi ${escapeHtml(customerName)},</p>
        <p>Thank you for booking <strong>${escapeHtml(service)}</strong> with Magari &amp; Co.</p>
        <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
        <p><strong>Summary</strong></p>
        <p>Subtotal: $${subtotal.toFixed(2)} · Deposit (50%): $${deposit.toFixed(2)}</p>
        ${timeline}
        ${schedule}
        <p>We’ve received your details and will be in touch within 24–48 hours. You’ll complete your deposit securely via the link we sent; the remaining balance is due when we deliver your design package or complete installation.</p>
        <p>With care,<br/>Elena<br/>Magari &amp; Co.</p>
      </div>
    `

    // Email to Magari (full details)
    const adminHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p><strong>New service request: ${escapeHtml(service)}</strong></p>
        <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
        <p><strong>Contact</strong></p>
        <ul style="margin:0 0 1em 1.2em;">
          <li>Name: ${escapeHtml(customerName)}</li>
          <li>Email: ${escapeHtml(contact.email || '—')}</li>
          <li>Phone: ${escapeHtml(contact.phone || '—')}</li>
          <li>Address: ${escapeHtml(contact.address || '—')}</li>
        </ul>
        <p><strong>Spaces &amp; details</strong></p>
        ${areasHtml}
        ${timeline}
        ${schedule}
        ${serviceMode}
        ${measurementVisit}
        ${installDays}
        ${desiredDate}
        ${deliveryOption}
        ${purchaseMethod}
        ${visit}
        <p><strong>Totals</strong></p>
        <p>Subtotal: $${subtotal.toFixed(2)} · Deposit: $${deposit.toFixed(2)}</p>
        <p>View full request and photos in Admin → Services.</p>
      </div>
    `

    const results = await Promise.all([
      customerEmail ? sendEmail(customerEmail, `Booking confirmation – ${reference} | Magari & Co.`, customerHtml) : { ok: true },
      sendEmail(MAGARI_EMAIL, `New service request: ${service} – ${reference}`, adminHtml),
    ])

    const failed = results.filter((r) => !r.ok)
    if (failed.length > 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: failed.map((f) => f.error).join('; ') }),
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('send-service-confirmation error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Server error' }),
    }
  }
}
