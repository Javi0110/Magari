/**
 * Netlify Function: vendor approval / rejection emails via Resend.
 * Netlify env: RESEND_API_KEY
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
  <h2 style="color: #4a7c59;">Congratulations, ${escapeHtml(name)}!</h2>
  <p>Your application to sell on the MOMade Marketplace by Magari &amp; Co. has been approved.</p>
  <p>You can now access your shop and start adding products, your logo, and store information.</p>
  <p><strong>YOUR LOGIN DETAILS:</strong></p>
  <ul>
    <li>Email: ${escapeHtml(email)}</li>
    <li>Access code: <strong>${escapeHtml(accessCode)}</strong></li>
    <li>Link: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>
  </ul>
  <p>Go to this link, click on &quot;Vendor Login&quot;, and enter your email and access code. Please keep this email in a safe place.</p>
  <p>If you lose your access code, contact us at ${MAGARI_EMAIL}.</p>
  <p>Welcome to the marketplace!</p>
  <p>— The Magari &amp; Co. team</p>
</body></html>`.trim()
}

function buildRejectionHtml({ name, businessName }) {
  const business = businessName || 'your business'
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${escapeHtml(name)},</p>
  <p>Thank you for your interest in joining the MOMade Marketplace by Magari &amp; Co.</p>
  <p>After reviewing your application for ${escapeHtml(business)}, we are not able to approve your account at this time.</p>
  <p>If you have any questions or would like more information, feel free to contact us at ${MAGARI_EMAIL}.</p>
  <p>We wish you all the best with your business.</p>
  <p>— The Magari &amp; Co. team</p>
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

exports.handler = async (event) => {
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
    subject = 'Approved — your MOMade vendor account is ready'
    html = buildApprovalHtml({ name: name || 'Vendor', email, accessCode, loginUrl })
  } else if (type === 'rejection') {
    subject = 'Update on your MOMade Marketplace application'
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
