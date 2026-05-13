/**
 * Calendly event / scheduling URL (no trailing slash).
 * Set `VITE_CALENDLY_URL` in Netlify + local `.env` to your real event link, e.g.
 * https://calendly.com/your-handle/30-minute-consultation
 */
const PLACEHOLDER = 'https://calendly.com/magari-co/placeholder-consult'

export function getCalendlyUrl() {
  const fromEnv = (import.meta.env.VITE_CALENDLY_URL || '').trim().replace(/\/$/, '')
  return fromEnv || PLACEHOLDER
}

/** URL for Calendly inline iframe embed */
export function getCalendlyEmbedUrl() {
  const base = getCalendlyUrl()
  try {
    const u = new URL(base)
    if (typeof window !== 'undefined' && window.location?.hostname) {
      u.searchParams.set('embed_domain', window.location.hostname)
    }
    u.searchParams.set('embed_type', 'Inline')
    return u.toString()
  } catch {
    return base
  }
}
