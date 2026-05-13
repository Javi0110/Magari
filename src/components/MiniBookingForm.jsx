import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { sendContactFormEmail, isEmailRelayConfigured } from '../utils/emailService'

export default function MiniBookingForm({ pageLabel, id = 'quick-book' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const configured = isEmailRelayConfigured()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setStatus('sending')
    const subject = `Quick booking — ${pageLabel}`
    const fullMessage = [
      `[Submitted from ${pageLabel} page — quick form]`,
      '',
      message.trim() || '(No message provided.)',
      '',
      `Phone: ${phone.trim() || '—'}`,
    ].join('\n')

    const result = await sendContactFormEmail({
      name: name.trim(),
      email: email.trim(),
      subject,
      message: fullMessage,
    })

    if (result.success) {
      setStatus('success')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      return
    }
    if (!configured) {
      setStatus('success')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      return
    }
    setError(result.error || 'Could not send right now. Try the full contact form or email magaribyelena@gmail.com.')
    setStatus('error')
  }

  return (
    <section id={id} className="max-w-2xl mx-auto scroll-mt-28">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-2">Quick request</h2>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
          A few lines is enough — we reply by email. Full form:{' '}
          <Link to="/contact#book" className="text-sage-dark font-medium hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>

      <div className="card p-6 md:p-8 border border-greige-light/80 bg-white/95">
        {status === 'success' ? (
          <p className="text-center text-neutral-700 text-sm md:text-base">
            Thank you — we received your request and will get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!configured && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Email relay not detected in dev. Set{' '}
                <code className="text-[11px]">VITE_EMAIL_RELAY_URL</code> or use <code className="text-[11px]">netlify dev</code>.
              </p>
            )}
            <div>
              <label className="form-label" htmlFor={`${id}-name`}>
                Name *
              </label>
              <input
                id={`${id}-name`}
                className="input-field"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="form-label" htmlFor={`${id}-email`}>
                Email *
              </label>
              <input
                id={`${id}-email`}
                type="email"
                className="input-field"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label" htmlFor={`${id}-phone`}>
                Phone <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                id={`${id}-phone`}
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="form-label" htmlFor={`${id}-message`}>
                What are you looking for? *
              </label>
              <textarea
                id={`${id}-message`}
                className="input-field min-h-[120px]"
                required
                minLength={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. staging walkthrough next month, buyer consult, listing prep…"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary w-full sm:w-auto disabled:opacity-50"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send request'
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
