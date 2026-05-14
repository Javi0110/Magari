/**
 * Origen público del sitio para enlaces de auth (reset de contraseña, OAuth).
 * En Netlify define VITE_PUBLIC_SITE_URL=https://casamagari.com (sin barra final).
 * Así el correo de Supabase no apunta a localhost aunque pidas el reset desde npm run dev.
 */
export function getPublicSiteOrigin() {
  const raw = (import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  if (raw) {
    try {
      const withProto = raw.startsWith('http') ? raw : `https://${raw}`
      const u = new URL(withProto)
      return `${u.protocol}//${u.host}`
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** URL completa donde Supabase redirige tras reset / OAuth (debe estar en Redirect URLs). */
export function getAdminAuthRedirectUrl() {
  const origin = getPublicSiteOrigin()
  if (!origin) return ''
  return `${origin}/admin`
}
