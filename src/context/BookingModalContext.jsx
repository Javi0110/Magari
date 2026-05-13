import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import CalendlyModal from '../components/CalendlyModal'

const BookingModalContext = createContext(null)

export function BookingModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const openBooking = useCallback(() => setIsOpen(true), [])
  const closeBooking = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({
      isOpen,
      openBooking,
      closeBooking,
    }),
    [isOpen, openBooking, closeBooking]
  )

  return (
    <BookingModalContext.Provider value={value}>
      {children}
      <CalendlyModal isOpen={isOpen} onClose={closeBooking} />
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const ctx = useContext(BookingModalContext)
  if (!ctx) {
    throw new Error('useBookingModal must be used within BookingModalProvider')
  }
  return ctx
}
