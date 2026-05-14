/**
 * Whether the fixed mobile "Book a Consultation" bar should render.
 * Opt-in only on a few marketing pages so it never blocks shop, rewards, MOMade, product detail, etc.
 */
const MOBILE_BOOK_BAR_PATHS = new Set(['/', '/services', '/about', '/real-estate', '/casa-magari'])

export function shouldShowMobileBookNowBar(pathname, cartOpen) {
  if (cartOpen) return false
  let p = (pathname || '').replace(/\/+$/, '')
  if (p === '') p = '/'
  return MOBILE_BOOK_BAR_PATHS.has(p)
}
