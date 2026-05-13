import { Link } from 'react-router-dom'
import { useBookingModal } from '../context/BookingModalContext'

/**
 * @param {'modal' | 'page'} variant — `modal` opens Calendly overlay; `page` navigates to `/book`.
 */
export default function BookConsultButton({
  variant = 'modal',
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const { openBooking } = useBookingModal()

  if (variant === 'page') {
    return (
      <Link to="/book" className={className} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={className} onClick={openBooking} {...rest}>
      {children}
    </button>
  )
}
