import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Instagram, MapPin, Send } from 'lucide-react'
import { sendContactFormEmail } from '../utils/emailService'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'

const SERVICE_OPTIONS = [
  { value: '', label: 'Service needed (select one)' },
  { value: 'virtual-design', label: 'Virtual Design' },
  { value: 'interior-design', label: 'Interior Design' },
  { value: 'staging', label: 'Staging' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'other', label: 'Other' },
]

function subjectForService(value) {
  switch (value) {
    case 'buyer':
      return 'real-estate-buying'
    case 'seller':
      return 'real-estate-selling'
    case 'virtual-design':
    case 'interior-design':
    case 'staging':
      return 'book-consultation'
    default:
      return 'general'
  }
}

function labelForService(value) {
  return SERVICE_OPTIONS.find((o) => o.value === value)?.label || value
}

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceNeeded: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const intent = searchParams.get('intent')
    const topic = searchParams.get('topic')
    setFormData((prev) => {
      let serviceNeeded = prev.serviceNeeded
      let message = prev.message

      if (intent === 'buyer') {
        serviceNeeded = 'buyer'
        message = message || 'I would like to schedule a buyer consultation.'
      } else if (intent === 'seller') {
        serviceNeeded = 'seller'
        message =
          message ||
          'I would like to discuss selling my home. (Real estate through eXp Realty — Elena Fadhel, Realtor®.)'
      } else if (intent === 'buy-design') {
        serviceNeeded = 'buyer'
        message = message || 'Interested in Buy + Design — book a consultation.'
      }

      if (topic) {
        const decoded = decodeURIComponent(topic)
        message = message || `I'm interested in: ${decoded}. Please follow up with availability.`
        if (!serviceNeeded) serviceNeeded = 'other'
      }

      return { ...prev, serviceNeeded, message }
    })
  }, [searchParams])

  const composedMessage = useMemo(() => {
    const svc = formData.serviceNeeded ? `Service needed: ${labelForService(formData.serviceNeeded)}\n\n` : ''
    return `${svc}${formData.message}`.trim()
  }, [formData.serviceNeeded, formData.message])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const subject = subjectForService(formData.serviceNeeded)
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject,
      message: [
        formData.phone.trim() ? `Phone: ${formData.phone.trim()}` : null,
        '',
        composedMessage,
      ]
        .filter(Boolean)
        .join('\n'),
    }

    try {
      await sendContactFormEmail(payload)
    } catch (error) {
      console.error('Error sending email:', error)
    }

    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', serviceNeeded: '', message: '' })
      setSubmitted(false)
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-cream py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-4">Contact &amp; Book</h1>
          <p className="text-lg text-neutral-600 mb-6">
            Primary spot for consults and inquiries — tell us what you need; we route it cleanly.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a href="/#lead-magnet" className="btn-outline text-sm py-2 px-4 inline-flex items-center justify-center">
              Free checklist
            </a>
            <InstagramDmCta className="btn-outline text-sm py-2 px-4 inline-flex items-center justify-center" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="card p-8 border border-greige-light/80">
              <h2 className="font-serif text-2xl text-neutral-700 mb-4">Contact</h2>
              <div className="space-y-6 text-sm text-neutral-600">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sage/10 flex items-center justify-center text-sage shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 mb-1">Email</p>
                    <a href="mailto:hello@magariandco.com" className="text-sage-dark hover:underline">
                      hello@magariandco.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-earth/10 flex items-center justify-center text-earth shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 mb-1">Instagram</p>
                    <a
                      href="https://instagram.com/magari.andco"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-earth-dark hover:underline"
                    >
                      @magariandco
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-taupe/10 flex items-center justify-center text-taupe shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 mb-1">Areas</p>
                    <p>Austin &amp; Georgetown, TX — plus select remote design.</p>
                    <p className="text-xs text-neutral-500 mt-2">Shop ships USA &amp; PR.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8 border border-greige-light/80 bg-white/90">
              <h3 className="font-serif text-xl text-neutral-800 mb-3">What happens after you inquire</h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-neutral-600 leading-relaxed">
                <li>We read your note within 24–48 business hours (often faster).</li>
                <li>If it is a fit, we send a short reply with next steps — sometimes a calendar link, sometimes a clarifying question.</li>
                <li>Real estate vs design: we label which lane we are in so you always know who is licensed for what.</li>
              </ol>
              <p className="text-xs text-neutral-500 mt-4">
                Buying/selling: Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty. Magari &amp; Co. is not a brokerage.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-greige-light p-6 text-sm text-neutral-600">
              <p className="font-medium text-neutral-800 mb-2">Quick links</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <Link to="/services" className="text-sage-dark hover:underline">
                  Services
                </Link>
                <Link to="/real-estate" className="text-sage-dark hover:underline">
                  Real Estate
                </Link>
                <Link to="/portfolio" className="text-sage-dark hover:underline">
                  Portfolio
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="order-1 lg:order-2">
            <div id="book" className="card p-8 border border-greige-light/80 scroll-mt-28">
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-2">Booking / inquiry</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Add photos in your message if you can — even phone snaps help.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-taupe/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-taupe" />
                  </div>
                  <h3 className="font-serif text-2xl text-neutral-700 mb-2">Message sent</h3>
                  <p className="text-neutral-600 text-sm">We&apos;ll get back within 24–48 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2 text-sm">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2 text-sm">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2 text-sm">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="Optional"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2 text-sm">Service needed *</label>
                    <select
                      required
                      value={formData.serviceNeeded}
                      onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                      className="input-field"
                    >
                      {SERVICE_OPTIONS.map((o) => (
                        <option key={o.value || 'empty'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2 text-sm">Message *</label>
                    <textarea
                      required
                      minLength={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-field min-h-36"
                      placeholder="Timeline, neighborhood, room photos, or what keeps you stuck…"
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary py-3.5 inline-flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        <PageBottomCta
          headline="Rather DM?"
          body="Instagram is fine for quick questions. For dates, contracts, or deposits, this form keeps us organized."
        />
      </div>
    </div>
  )
}
