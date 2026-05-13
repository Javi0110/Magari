import { Link } from 'react-router-dom'

/**
 * Consultation scheduling on the Contact page (on-site wizard, not a third-party embed).
 * @param {'modal' | 'page'} variant — Kept for call-site compatibility; both resolve to `/contact#book`.
 */
export default function BookConsultButton({
  variant: _variant = 'modal',
  className = '',
  children,
  ...rest
}) {
  return (
    <Link to="/contact#book" className={className} {...rest}>
      {children}
    </Link>
  )
}
