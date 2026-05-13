/**
 * Correos transaccionales vía relay Netlify + Resend (gratis en tier Resend).
 * En local: define VITE_EMAIL_RELAY_URL apuntando a tu función desplegada, o usa `netlify dev`.
 * @see EMAIL_SETUP.md
 */

const MAGARI_EMAIL = 'magaribyelena@gmail.com'

/** URL completa del endpoint, ej. https://casamagari.com/.netlify/functions/send-magari-mail */
export function getMagariMailRelayUrl() {
  const explicit = (import.meta.env.VITE_EMAIL_RELAY_URL || '').trim().replace(/\/$/, '')
  if (explicit) return explicit
  if (import.meta.env.DEV) return ''
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/.netlify/functions/send-magari-mail`
}

export function isEmailRelayConfigured() {
  return !!getMagariMailRelayUrl()
}

async function postMagariRelay(payload) {
  const url = getMagariMailRelayUrl()
  if (!url) {
    console.warn(
      '[email] Sin relay: en desarrollo añade VITE_EMAIL_RELAY_URL=https://TU-DOMINIO/.netlify/functions/send-magari-mail o ejecuta netlify dev.'
    )
    return { success: false, error: 'Email relay not configured (VITE_EMAIL_RELAY_URL or production deploy)' }
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[email] Relay error:', data.error || res.statusText)
      return { success: false, error: data.error || res.statusText }
    }
    return { success: true, magariSent: true, customerSent: true }
  } catch (err) {
    console.error('[email] Relay fetch:', err)
    return { success: false, error: err?.message || 'Network error' }
  }
}

export const sendServiceRequestEmail = async (serviceData) => {
  return postMagariRelay({ kind: 'service_request', serviceData })
}

export const sendContactFormEmail = async (formData) => {
  return postMagariRelay({
    kind: 'contact',
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
  })
}

export const sendVendorApplicationEmail = async (applicationData) => {
  return postMagariRelay({ kind: 'vendor_application', applicationData })
}

export const sendLeadMagnetChecklistEmail = async ({
  name,
  email,
  phone,
  serviceInterest,
  source = 'Lead magnet',
}) => {
  if (!email?.trim()) {
    return { success: false, error: 'Email required' }
  }
  return postMagariRelay({
    kind: 'lead_magnet',
    name: name?.trim() || '—',
    email: email.trim(),
    phone: phone || '',
    serviceInterest: serviceInterest || '',
    source,
  })
}

export { MAGARI_EMAIL }
