/**
 * Loads GA4 only when VITE_GA_MEASUREMENT_ID is set (avoids broken placeholder requests in index.html).
 * Meta Pixel: add similar loader when VITE_META_PIXEL_ID is needed.
 */
export function initThirdPartyAnalytics() {
  if (typeof document === 'undefined') return
  const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()
  if (!gaId) return

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  gtag('js', new Date())

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
  s.onload = () => {
    gtag('config', gaId)
  }
  document.head.appendChild(s)
}
