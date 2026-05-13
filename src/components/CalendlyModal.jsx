import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import CalendlyIframe from './CalendlyIframe'

export default function CalendlyModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Book a consultation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-cream rounded-t-3xl sm:rounded-3xl shadow-2xl border border-greige-light flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-greige-light/80 bg-white/95 shrink-0">
              <div>
                <p className="font-serif text-lg text-neutral-800">Book a consultation</p>
                <p className="text-xs text-neutral-500">Calendly — replace placeholder URL in env (see .env.example)</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-neutral-600 hover:bg-cream border border-greige-light transition-colors"
                aria-label="Close booking"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white">
              <CalendlyIframe className="min-h-[560px]" />
            </div>
            <div className="px-4 py-3 border-t border-greige-light/80 bg-cream/90 text-center text-xs text-neutral-600 shrink-0">
              Prefer the full page?{' '}
              <Link to="/book" onClick={onClose} className="text-sage-dark font-medium hover:underline">
                Open /book
              </Link>{' '}
              ·{' '}
              <Link to="/contact#book" onClick={onClose} className="text-sage-dark font-medium hover:underline">
                Contact form
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
