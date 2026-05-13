import { useState } from 'react'
import { Send, Loader2, Download } from 'lucide-react'
import { sendLeadMagnetChecklistEmail, isEmailRelayConfigured } from '../utils/emailService'

const SERVICE_OPTIONS = [
  { value: '', label: 'Interested in (pick one)' },
  { value: 'interior-design', label: 'Interior Design' },
  { value: 'staging', label: 'Staging' },
  { value: 'buying', label: 'Buying' },
  { value: 'selling', label: 'Selling' },
]

export default function LeadMagnetForm({
  id = 'lead-magnet',
  title = 'Free home prep checklist',
  subtitle = 'Photos, walk-through flow, quick wins — plus what to leave to a pro. One PDF, no fluff.',
  source = 'Homepage lead magnet',
  compact = false,
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const configured = isEmailRelayConfigured()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setStatus('sending')
    const result = await sendLeadMagnetChecklistEmail({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      serviceInterest: form.serviceInterest,
      source,
    })
    if (result.success) {
      setStatus('success')
      setForm({ name: '', email: '', phone: '', serviceInterest: '' })
      return
    }
    if (!configured) {
      setStatus('success')
      setForm({ name: '', email: '', phone: '', serviceInterest: '' })
      return
    }
    setError(result.error || 'Could not send right now. Please email hello@magariandco.com.')
    setStatus('error')
  }

  return (
    <div id={id} className="scroll-mt-28">
      <div className={compact ? '' : 'text-center max-w-2xl mx-auto mb-10'}>
        <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3 text-balance">
          {title}
        </h2>
        <p className="text-neutral-600 leading-relaxed">{subtitle}</p>
      </div>

      <div className="max-w-xl mx-auto card p-6 md:p-8 border border-sage-muted/50 bg-white/90">
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-sage-muted/40 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-sage-dark" />
            </div>
            <h3 className="font-serif text-2xl text-neutral-700 mb-2">You&apos;re in.</h3>
            <p className="text-neutral-600 text-sm md:text-base mb-6">
              PDF below. Same link is in your email — peek spam if you don&apos;t see it in a few minutes.
            </p>
            <a
              href="/home-prep-checklist.pdf"
              download="Magari-Home-Prep-Checklist.pdf"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5"
            >
              <Download className="w-5 h-5" />
              Download PDF checklist
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!configured && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Relay de correo no detectado en desarrollo. Añade en <code className="text-[11px]">.env</code>:{' '}
                <code className="text-[11px]">VITE_EMAIL_RELAY_URL=https://casamagari.com/.netlify/functions/send-magari-mail</code>{' '}
                o ejecuta <code className="text-[11px]">netlify dev</code>. Ver <code className="text-[11px]">EMAIL_SETUP.md</code>.
              </p>
            )}
            <div>
              <label className="form-label">Name *</label>
              <input
                className="input-field"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                className="input-field"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                className="input-field"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 000-0000"
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="form-label">Interested in</label>
              <select
                className="input-field !rounded-xl"
                value={form.serviceInterest}
                onChange={(e) => setForm((f) => ({ ...f, serviceInterest: e.target.value }))}
              >
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o.value || 'empty'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full btn-primary inline-flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Download Free Home Prep Checklist
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
