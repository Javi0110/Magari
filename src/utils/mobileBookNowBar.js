/**
 * Whether the fixed mobile "Book a Consultation" bar should render.
 * Hide where it is redundant (Contact), blocks flows (checkout, cart), or clashes with MOMade vendor UI.
 */
export function shouldShowMobileBookNowBar(pathname, cartOpen) {
  if (cartOpen) return false
  const p = pathname || ''
  if (p.startsWith('/admin')) return false
  if (p.startsWith('/contact')) return false
  if (p.startsWith('/checkout')) return false
  if (
    p.startsWith('/momade/shop') ||
    p.startsWith('/momade/vendor-login') ||
    p.startsWith('/momade/become-a-vendor')
  ) {
    return false
  }
  return true
}
