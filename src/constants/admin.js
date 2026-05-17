/** Must match supabase migration is_magari_admin() and Netlify env if overridden. */
export const MAGARI_ADMIN_EMAIL = (
  import.meta.env.VITE_MAGARI_ADMIN_EMAIL || 'magaribyelena@gmail.com'
)
  .trim()
  .toLowerCase()

export function isMagariAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === MAGARI_ADMIN_EMAIL
}
