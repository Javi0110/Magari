/**
 * Unified relay: contact, vendor application, lead magnet, service request, consultation.
 * Resend. Netlify: RESEND_API_KEY (+ optional RESEND_FROM_EMAIL).
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
      const internalHtml = `<p><strong>Website contact</strong></p>
<p>From: ${escapeHtml(name)}<br/>Email: ${escapeHtml(email)}<br/>Subject: ${escapeHtml(subj || '—')}</p>
<p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`
      const r1 = await sendResend(MAGARI_EMAIL, `Contact: ${subj || 'New message'}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const replyHtml = `<p>Hi ${escapeHtml(name)},</p>
<p>Thank you for reaching out. We’ve received your message and will reply as soon as we can (typically within 24–48 business hours).</p>
<p><em>Your message:</em><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
<p>— Magari &amp; Co.<br/><a href="mailto:${MAGARI_EMAIL}">${MAGARI_EMAIL}</a></p>`
      const r2 = await sendResend(email, 'Thanks for contacting Magari & Co.', replyHtml)
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
<li>Name: ${escapeHtml(name)}</li>
<li>Email: ${escapeHtml(email)}</li>
<li>Phone: ${escapeHtml(phone || '—')}</li>
<li>Interest: ${escapeHtml(serviceInterest || '—')}</li>
</ul>
<p>PDF: <a href="${CHECKLIST_PDF_URL}">${CHECKLIST_PDF_URL}</a></p>`
      const r1 = await sendResend(MAGARI_EMAIL, `Home Prep Checklist — ${name}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const replyHtml = `<p>Hi ${escapeHtml(name)},</p>
<p>Thank you for requesting the <strong>Home Prep Checklist</strong>. Download the PDF here:</p>
<p><a href="${CHECKLIST_PDF_URL}">${CHECKLIST_PDF_URL}</a></p>
<p>If the link doesn’t open, reply to this email and we’ll send it as an attachment.</p>
<p>Book a consultation: <a href="https://casamagari.com/contact#book">casamagari.com/contact</a></p>
<p>— Magari &amp; Co.</p>`
      const r2 = await sendResend(email, 'Your checklist — Magari & Co.', replyHtml)
      if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    if (kind === 'vendor_application') {
      const a = body.applicationData || body
      const categoriesList = (a.categories || []).join(', ') || 'N/A'
      const imageCount = a.sampleImages?.length || 0
      const internalHtml = `<p><strong>New MOMade vendor application</strong></p>
<ul>
<li>Name: ${escapeHtml(a.name)}</li>
<li>Business: ${escapeHtml(a.businessName)}</li>
<li>Email: ${escapeHtml(a.email)}</li>
<li>Phone: ${escapeHtml(a.phone || '—')}</li>
<li>Instagram: ${escapeHtml(a.instagram || '—')}</li>
<li>Categories: ${escapeHtml(categoriesList)}</li>
<li>Bio: ${escapeHtml(a.bio || '—')}</li>
<li>Sample images: ${imageCount}</li>
<li>Payout: ${escapeHtml(a.payoutMethod || '—')} / ${escapeHtml(a.payoutEmail || '—')}</li>
</ul>`
      const r1 = await sendResend(
        MAGARI_EMAIL,
        `Vendor: ${a.businessName || a.name || 'application'}`,
        internalHtml
      )
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const replyHtml = `<p>Hi ${escapeHtml(a.name)},</p>
<p>We’ve received your application for the MOMade Marketplace. We’ll review your profile and get back to you within 3–5 business days.</p>
<p>— Magari &amp; Co.</p>`
      const r2 = await sendResend(a.email, 'Application received — MOMade / Magari & Co.', replyHtml)
      if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    if (kind === 'service_request') {
      const s = body.serviceData || body
      const lines = [
        `Service: ${escapeHtml(s.service)}`,
        `Ref: ${escapeHtml(s.reference)}`,
        `Contact: ${escapeHtml(s.contact?.fullName || s.contact?.name)} / ${escapeHtml(s.contact?.email)}`,
        `Phone: ${escapeHtml(s.contact?.phone || '—')}`,
        `City / ZIP: ${escapeHtml(s.contact?.cityZip || '—')}`,
        `Subtotal: $${s.subtotal ?? '0'} · Deposit: $${s.deposit ?? '0'}`,
      ]
      let intakeBlock = ''
      const rows = s.payload?.intakeSummary
      if (Array.isArray(rows) && rows.length > 0) {
        intakeBlock =
          '<p><strong>Form (details)</strong></p><ul style="margin:8px 0;padding-left:18px">' +
          rows
            .map(
              (row) =>
                `<li style="margin:4px 0"><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(String(row.value || '—')).replace(/\n/g, '<br/>')}</li>`
            )
            .join('') +
          '</ul>'
      }
      const internalHtml = `<p><strong>Service request</strong></p><p>${lines.join('<br/>')}</p>${intakeBlock}`
      const r1 = await sendResend(MAGARI_EMAIL, `Service: ${s.service} — ${s.reference}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const em = s.contact?.email
      if (em) {
        const replyHtml = `<p>Hi ${escapeHtml(s.contact?.fullName || s.contact?.name || 'there')},</p>
<p>We’ve received your request <strong>${escapeHtml(s.reference)}</strong>. We’ll be in touch within 24–48 hours.</p>
<p>— Magari &amp; Co.</p>`
        const r2 = await sendResend(em, `Confirmation — ${s.reference}`, replyHtml)
        if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) }
    }

    if (kind === 'consultation_booked') {
      const { guestName, guestEmail, serviceLabel, slotLabel, requestId } = body
      if (!guestEmail || !serviceLabel || !slotLabel) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing fields' }) }
      }
      const internalHtml = `<p><strong>New consultation request</strong></p>
<ul>
<li>ID: ${escapeHtml(requestId || '—')}</li>
<li>Name: ${escapeHtml(guestName || '—')}</li>
<li>Email: ${escapeHtml(guestEmail)}</li>
<li>Service: ${escapeHtml(serviceLabel)}</li>
<li>Time: ${escapeHtml(slotLabel)}</li>
</ul>
<p><a href="https://casamagari.com/admin">Open Admin → Consultations</a></p>`
      const r1 = await sendResend(MAGARI_EMAIL, `Consultation: ${serviceLabel}`, internalHtml)
      if (!r1.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r1.error }) }

      const guestHtml = `<p>Hi ${escapeHtml(guestName || 'there')},</p>
<p>We’ve received your <strong>consultation request</strong> for <strong>${escapeHtml(serviceLabel)}</strong>.</p>
<p><strong>Requested time:</strong><br/>${escapeHtml(slotLabel)}</p>
<p>We’ll confirm by email if anything needs to change. If you don’t hear from us within 24–48 business hours, write us at <a href="mailto:${MAGARI_EMAIL}">${MAGARI_EMAIL}</a>.</p>
<p>— Magari &amp; Co.</p>`
      const r2 = await sendResend(
        guestEmail,
        'Confirmation — consultation requested (Magari & Co.)',
        guestHtml
      )
      if (!r2.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: r2.error }) }
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
