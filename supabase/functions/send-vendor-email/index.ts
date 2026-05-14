// Sends vendor approval (with credentials) or rejection email via Resend.
// Requires: RESEND_API_KEY in Supabase Secrets.
// Called from the frontend when an admin approves or rejects an application.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Magari <onboarding@resend.dev>'
const MAGARI_EMAIL = Deno.env.get('MAGARI_EMAIL') || 'magaribyelena@gmail.com'

interface ApprovalPayload {
  type: 'approval'
  email: string
  name: string
  businessName: string
  accessCode: string
  loginUrl?: string
}

interface RejectionPayload {
  type: 'rejection'
  email: string
  name: string
  businessName?: string
}

type Payload = ApprovalPayload | RejectionPayload

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendResend(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not set' }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
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

function buildApprovalEmail(p: ApprovalPayload): { subject: string; html: string } {
  const loginUrl = p.loginUrl || 'https://casamagari.com/marketplace'
  const subject = 'Approved — your MOMade vendor account is ready'
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4a7c59;">Congratulations, ${escapeHtml(p.name)}!</h2>
  <p>Your application to sell on the MOMade Marketplace by Magari &amp; Co. has been approved.</p>
  <p>You can now access your shop and start adding products, your logo, and store information.</p>
  <p><strong>YOUR LOGIN DETAILS:</strong></p>
  <ul>
    <li>Email: ${escapeHtml(p.email)}</li>
    <li>Access code: <strong>${escapeHtml(p.accessCode)}</strong></li>
    <li>Link: <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></li>
  </ul>
  <p>Go to this link, click &quot;Vendor Login&quot;, and enter your email and access code. Please keep this email in a safe place.</p>
  <p>If you lose your access code, contact us at ${MAGARI_EMAIL}.</p>
  <p>Welcome to the marketplace!</p>
  <p>— The Magari &amp; Co. team</p>
</body></html>`.trim()
  return { subject, html }
}

function buildRejectionEmail(p: RejectionPayload): { subject: string; html: string } {
  const subject = 'Update on your MOMade Marketplace application'
  const business = p.businessName || 'your business'
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <p>Hi ${escapeHtml(p.name)},</p>
  <p>Thank you for your interest in joining the MOMade Marketplace by Magari &amp; Co.</p>
  <p>After reviewing your application for ${escapeHtml(business)}, we are not able to approve your account at this time. If you have questions, contact us at ${MAGARI_EMAIL}.</p>
  <p>We wish you all the best with your business.</p>
  <p>— The Magari &amp; Co. team</p>
</body></html>`.trim()
  return { subject, html }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }
  let body: Payload
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }
  if (!body.type || !body.email) {
    return jsonResponse({ error: 'Missing type or email' }, 400)
  }
  let subject: string
  let html: string
  if (body.type === 'approval') {
    const p = body as ApprovalPayload
    if (!p.accessCode) {
      return jsonResponse({ error: 'Missing accessCode for approval' }, 400)
    }
    const built = buildApprovalEmail(p)
    subject = built.subject
    html = built.html
  } else if (body.type === 'rejection') {
    const built = buildRejectionEmail(body as RejectionPayload)
    subject = built.subject
    html = built.html
  } else {
    return jsonResponse({ error: 'Invalid type' }, 400)
  }
  const result = await sendResend(body.email, subject, html)
  if (!result.ok) {
    return jsonResponse({ error: result.error }, 500)
  }
  return jsonResponse({ ok: true }, 200)
})
