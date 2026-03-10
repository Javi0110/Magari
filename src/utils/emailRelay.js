/**
 * Email relay vía Netlify Function + Resend.
 * El frontend llama a /.netlify/functions/send-vendor-email (mismo dominio en Netlify).
 */

const RELAY_URL = '/.netlify/functions/send-vendor-email'

async function postRelay(payload) {
  const res = await fetch(RELAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { success: false, error: data.error || res.statusText }
  return { success: true }
}

export async function sendVendorApprovalEmail({ email, name, businessName, accessCode, loginUrl }) {
  return postRelay({
    type: 'approval',
    email,
    name: name || '',
    businessName: businessName || '',
    accessCode: accessCode || '',
    loginUrl: loginUrl || '',
  })
}

export async function sendVendorRejectionEmail({ email, name, businessName }) {
  return postRelay({
    type: 'rejection',
    email,
    name: name || '',
    businessName: businessName || '',
  })
}
