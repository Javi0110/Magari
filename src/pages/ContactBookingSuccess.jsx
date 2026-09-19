import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Calendar } from 'lucide-react'
import { BOOKING_TIMEZONE_LABEL } from '../constants/consultationBooking'
import WhatsAppCta from '../components/WhatsAppCta'

export default function ContactBookingSuccessPage() {
  const location = useLocation()
  const state = location.state || {}
  const { serviceLabel, slotLabel, preferredContact } = state
  const waNote =
    preferredContact === 'whatsapp'
      ? 'We will follow up on WhatsApp. You can also start the thread now.'
      : 'You will get a confirmation email shortly (check spam).'

  return (
    <div className="min-h-screen bg-cream py-16 md:py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center rounded-2xl border border-greige-light bg-white/95 p-8 sm:p-10"
      >
        <div className="w-16 h-16 rounded-full bg-sage-muted/40 flex items-center justify-center mx-auto mb-6 text-sage">
          <Check className="w-8 h-8" strokeWidth={2} />
        </div>
        <h1 className="font-serif text-3xl text-neutral-800 mb-3">You&apos;re on the calendar</h1>
        <p className="text-neutral-600 text-sm mb-6">
          We received your consultation request. {waNote} Times are in{' '}
          <span className="font-medium text-neutral-700">{BOOKING_TIMEZONE_LABEL}</span>.
        </p>
        {(serviceLabel || slotLabel) && (
          <div className="rounded-xl border border-sage-muted/40 bg-cream/60 px-4 py-4 text-left text-sm text-neutral-700 space-y-2 mb-8">
            {serviceLabel && (
              <p>
                <span className="font-semibold text-sage-dark">Service:</span> {serviceLabel}
              </p>
            )}
            {slotLabel && (
              <p className="flex gap-2">
                <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-sage" />
                <span>
                  <span className="font-semibold text-sage-dark">Requested time:</span> {slotLabel}
                </span>
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-outline">
            Home
          </Link>
          {preferredContact === 'whatsapp' ? (
            <WhatsAppCta
              className="btn-primary inline-flex items-center justify-center gap-2"
              message={`Hi Elena — I just requested a consultation${serviceLabel ? ` for ${serviceLabel}` : ''}${slotLabel ? ` (${slotLabel})` : ''}.`}
            >
              Continue on WhatsApp
            </WhatsAppCta>
          ) : (
            <Link to="/contact" className="btn-primary">
              Back to Contact
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}
