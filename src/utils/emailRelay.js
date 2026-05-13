/**
 * Aprobación / rechazo vendor vía Netlify + Resend (send-vendor-email).
 * @see EMAIL_RELAY_PASOS.md
 */

const VENDOR_RELATIVE = '/.netlify/functions/send-vendor-email'

export function getVendorEmailRelayUrl() {
  const explicit = (import.meta.env.VITE_VENDOR_EMAIL_RELAY_URL || '').trim().replace(/\/$/, '')
  if (explicit) return explicit
  if (import.meta.env.DEV) return ''
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${VENDOR_RELATIVE}`
}

async function postVendorRelay(payload) {
  const url = getVendorEmailRelayUrl()
  if (!url) {
    console.warn('[email] Vendor relay: usa netlify dev o VITE_VENDOR_EMAIL_RELAY_URL / despliegue en Netlify.')
    return { success: false, error: 'Vendor email relay not configured' }
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, error: data.error || res.statusText }
    return { success: true }
  } catch (err) {
    console.error('Vendor relay:', err)
    return { success: false, error: err?.message || 'Network error' }
  }
}

export async function sendVendorApprovalEmail({ email, name, businessName, accessCode, loginUrl }) {
  return postVendorRelay({
    type: 'approval',
    email,
    name: name || '',
    businessName: businessName || '',
    accessCode: accessCode || '',
    loginUrl: loginUrl || '',
  })
}

export async function sendVendorRejectionEmail({ email, name, businessName }) {
  return postVendorRelay({
    type: 'rejection',
    email,
    name: name || '',
    businessName: businessName || '',
  })
}
