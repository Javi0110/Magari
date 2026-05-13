import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { sendContactFormEmail, isEmailRelayConfigured } from '../utils/emailService'

export default function RealEstateLeadForm({
  id = 'real-estate-lead',
  formTitle = "Let's connect",
  formIntro = "Fill out the form and I'll reach out within 24–48 hours.",
  submitLabel = 'Send Message',
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('buyer')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const configured = isEmailRelayConfigured()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setStatus('sending')
    const subject = role === 'seller' ? 'real-estate-selling' : 'real-estate-buying'
    const fullMessage = [
      `[Real estate page — ${role === 'seller' ? 'Seller' : 'Buyer'} lead]`,
      '',
      message.trim() || '(No message.)',
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
      setRole('buyer')
      return
    }
    if (!configured) {
      setStatus('success')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      setRole('buyer')
      return
    }
    setError(result.error || 'Could not send. Try hello@magariandco.com.')
    setStatus('error')
  }

  return (
    <section id={id} className="max-w-xl mx-auto scroll-mt-28">
      <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-2 text-center">{formTitle}</h2>
      <p className="text-sm text-neutral-600 text-center mb-6 max-w-md mx-auto leading-relaxed">{formIntro}</p>

      <div className="card p-6 md:p-8 border border-greige-light/80 bg-white/95">
        {status === 'success' ? (
          <p className="text-center text-neutral-700">Got it — we&apos;ll follow up by email.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!configured && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Email relay not configured in dev. Set <code className="text-[11px]">VITE_EMAIL_RELAY_URL</code> or run{' '}
                <code className="text-[11px]">netlify dev</code>.
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
                Phone
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
              <label className="form-label" htmlFor={`${id}-role`}>
                I am interested in *
              </label>
              <select
                id={`${id}-role`}
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="buyer">Buying</option>
                <option value="seller">Selling</option>
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor={`${id}-msg`}>
                Message *
              </label>
              <textarea
                id={`${id}-msg`}
                className="input-field min-h-[100px]"
                required
                minLength={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Timeline, neighborhood, or listing goals…"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary w-full disabled:opacity-50"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
