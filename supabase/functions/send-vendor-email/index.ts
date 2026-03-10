// Envía al vendor un email de aprobación (con credenciales) o de rechazo usando Resend.
// Requiere: RESEND_API_KEY en Supabase Secrets.
// El frontend llama a esta función cuando el admin aprueba o rechaza una solicitud.

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
  const subject = '¡Aprobada! Tu cuenta de vendor MOMade está lista'
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4a7c59;">¡Felicidades, ${escapeHtml(p.name)}!</h2>
  <p>Tu solicitud para vender en el MOMade Marketplace de Magari &amp; Co. ha sido aprobada.</p>
  <p>Ya puedes acceder a tu tienda y comenzar a añadir productos, logo e información.</p>
  <p><strong>TUS CREDENCIALES DE ACCESO:</strong></p>
  <ul>
    <li>Email: ${escapeHtml(p.email)}</li>
    <li>Código de acceso: <strong>${escapeHtml(p.accessCode)}</strong></li>
    <li>Enlace: <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></li>
  </ul>
  <p>Ve a ese enlace, haz clic en "Vendor Login" e introduce tu email y el código de acceso. Guarda este correo en un lugar seguro.</p>
  <p>Si pierdes tu código, contáctanos en ${MAGARI_EMAIL}.</p>
  <p>¡Bienvenida al marketplace!</p>
  <p>— El equipo de Magari &amp; Co.</p>
</body></html>`.trim()
  return { subject, html }
}

function buildRejectionEmail(p: RejectionPayload): { subject: string; html: string } {
  const subject = 'Actualización de tu solicitud MOMade Marketplace'
  const business = p.businessName || 'tu negocio'
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
  <p>Hola ${escapeHtml(p.name)},</p>
  <p>Gracias por tu interés en unirte al MOMade Marketplace de Magari &amp; Co.</p>
  <p>Después de revisar tu solicitud para ${escapeHtml(business)}, en este momento no podemos aprobar tu cuenta. Si tienes preguntas, contáctanos en ${MAGARI_EMAIL}.</p>
  <p>Te deseamos mucho éxito con tu emprendimiento.</p>
  <p>— El equipo de Magari &amp; Co.</p>
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
