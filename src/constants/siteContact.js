/** Public studio contact — email plus WhatsApp Business click-to-chat. */

export const STUDIO_EMAIL = 'magaribyelena@gmail.com'

/**
 * WhatsApp Business. Env override: VITE_WHATSAPP_NUMBER (digits only).
 * Fallback is the studio number so production works without a Netlify env var.
 */
const DEFAULT_WHATSAPP_DIGITS = '19394172141'

function normalizeWhatsAppDigits(raw) {
  let digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) digits = `1${digits}`
  return digits
}

export const WHATSAPP_DIGITS = normalizeWhatsAppDigits(
  import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_DIGITS
)

export function isWhatsAppConfigured() {
  return WHATSAPP_DIGITS.length >= 10
}

export function whatsappHref(prefilledMessage = '') {
  if (!isWhatsAppConfigured()) return ''
  const text = prefilledMessage ? `?text=${encodeURIComponent(prefilledMessage)}` : ''
  return `https://wa.me/${WHATSAPP_DIGITS}${text}`
}

export function formatPreferredContactLine(preferred, phone) {
  if (preferred === 'whatsapp') {
    return `Preferred contact: WhatsApp${phone ? ` (${phone})` : ''}`
  }
  return 'Preferred contact: Email'
}
