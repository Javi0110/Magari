// Supabase Edge Function: emails magaribyelena@gmail.com on INSERT into vendor_applications (or future tables).
// Requires: RESEND_API_KEY in Secrets. Optional: MAGARI_EMAIL (default magaribyelena@gmail.com)

const MAGARI_EMAIL = Deno.env.get('MAGARI_EMAIL') || 'magaribyelena@gmail.com'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Magari <onboarding@resend.dev>'

interface WebhookPayload {
  type: 'INSERT'
  table: string
  schema: string
  record: Record<string, unknown>
  old_record: null
}

function buildVendorApplicationEmail(record: Record<string, unknown>): { subject: string; html: string } {
  const name = (record.name as string) || 'N/A'
  const businessName = (record.business_name as string) || 'N/A'
  const email = (record.email as string) || 'N/A'
  const phone = (record.phone as string) || ''
  const instagram = (record.instagram as string) || ''
  const categories = (record.categories as string[]) || []
  const bio = (record.bio as string) || 'N/A'
  const payoutMethod = (record.payout_method as string) || 'N/A'
  const payoutEmail = (record.payout_email as string) || 'N/A'
  const submittedAt = record.submitted_at as string
  const dateStr = submittedAt ? new Date(submittedAt).toLocaleString('en-US') : new Date().toLocaleString('en-US')

  const categoriesStr = Array.isArray(categories) ? categories.join(', ') : 'N/A'
  const formData = (record.form_data as Record<string, unknown>) || {}
  const sampleCount = (formData.sampleImageCount as number) ?? 0

  const subject = `New vendor application: ${businessName}`
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New vendor application</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333;">
  <h2 style="color: #4a7c59;">New vendor application — MOMade Marketplace</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Business:</strong> ${escapeHtml(businessName)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
  ${instagram ? `<p><strong>Instagram:</strong> ${escapeHtml(instagram)}</p>` : ''}
  <p><strong>Categories:</strong> ${escapeHtml(categoriesStr)}</p>
  <p><strong>Bio:</strong> ${escapeHtml(bio)}</p>
  <p><strong>Sample images:</strong> ${sampleCount}</p>
  <p><strong>Payout:</strong> ${escapeHtml(payoutMethod)} – ${escapeHtml(payoutEmail)}</p>
  <p><strong>Submitted:</strong> ${dateStr}</p>
  <hr style="margin: 1.5em 0;">
  <p style="font-size: 0.9em; color: #666;">Automated notification from Magari. Review the application in Admin → Vendors.</p>
</body>
</html>
  `.trim()

  return { subject, html }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendResend(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not set' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    return { ok: false, error: `${res.status} ${err}` }
  }
  return { ok: true }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  if (payload.type !== 'INSERT' || !payload.record) {
    return new Response(JSON.stringify({ error: 'Expected INSERT payload with record' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const table = payload.table
  const record = payload.record as Record<string, unknown>

  if (table === 'vendor_applications') {
    const { subject, html } = buildVendorApplicationEmail(record)
    const result = await sendResend(MAGARI_EMAIL, subject, html)
    if (!result.ok) {
      console.error('Resend error:', result.error)
      return new Response(JSON.stringify({ error: result.error }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({ ok: true, message: 'Email sent to Magari' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Futuro: if (table === 'orders') { ... }
  return new Response(JSON.stringify({ ok: true, message: 'No action for this table' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
