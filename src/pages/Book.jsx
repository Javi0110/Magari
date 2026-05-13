import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import CalendlyIframe from '../components/CalendlyIframe'
import BookConsultButton from '../components/BookConsultButton'

export default function BookPage() {
  return (
    <div className="min-h-screen bg-cream py-10 md:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-sage-dark hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl text-neutral-800 mb-2">Book a consultation</h1>
          <p className="text-neutral-600 text-sm md:text-base max-w-xl mx-auto">
            Pick a time below (Calendly). Set <code className="text-xs bg-white px-1 py-0.5 rounded">VITE_CALENDLY_URL</code>{' '}
            to your real scheduling link when ready.
          </p>
        </motion.div>

        <div className="card p-4 sm:p-6 border border-greige-light/80 bg-white/95 mb-8">
          <CalendlyIframe />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-neutral-600">
          <BookConsultButton variant="modal" className="btn-outline px-6 py-2.5">
            Open in popup instead
          </BookConsultButton>
          <Link to="/contact#book" className="text-sage-dark font-medium hover:underline">
            Use contact form instead →
          </Link>
        </div>
      </div>
    </div>
  )
}
