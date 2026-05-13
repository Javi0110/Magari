import { useState, useMemo, useEffect } from 'react'
import { X, Loader2, Send } from 'lucide-react'
import { getIntakeConfig } from '../../constants/serviceIntakeConfigs'
import { submitServiceIntake } from '../../utils/submitServiceIntake'

const initialContact = { fullName: '', email: '', phone: '', cityZip: '' }

export default function ServiceIntakeModal({ open, onClose, intakeKey, packageName, headlineOverride }) {
  const config = useMemo(() => (intakeKey ? getIntakeConfig(intakeKey) : null), [intakeKey])
  const [contact, setContact] = useState(initialContact)
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [doneRef, setDoneRef] = useState(null)
  const [emailNote, setEmailNote] = useState(null)

  useEffect(() => {
    if (!open) return
    setContact(initialContact)
    setAnswers({})
    setStatus('idle')
    setError('')
    setDoneRef(null)
    setEmailNote(null)
  }, [open, intakeKey, packageName])

  if (!open || !config) return null

  const headline = headlineOverride || config.title

  const setAnswer = (name, value) => {
    setAnswers((a) => ({ ...a, [name]: value }))
  }

  const validate = () => {
    if (!contact.fullName?.trim()) return 'Name is required.'
    if (!contact.email?.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) return 'Enter a valid email.'
    if (!contact.phone?.trim()) return 'Phone is required.'
    for (const f of config.fields) {
      if (!f.required) continue
      const v = answers[f.name]
      if (v == null || String(v).trim() === '' || v === '') {
        return `Please fill in: ${f.label}`
      }
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    setStatus('sending')
    const res = await submitServiceIntake({
      intakeKey,
      packageName: intakeKey === 'package' ? packageName : undefined,
      answers,
      contact: {
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        cityZip: contact.cityZip?.trim(),
      },
    })
    setStatus('idle')
    if (!res.ok) {
      setError(res.error || 'Something went wrong.')
      return
    }
    setDoneRef(res.reference)
    if (res.emailWarning) setEmailNote(res.emailWarning)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="intake-modal-title">
      <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-lg sm:max-w-xl max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-greige-light flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-greige-light/80 bg-cream/60">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-dark mb-1">Magari &amp; Co.</p>
            <h2 id="intake-modal-title" className="font-serif text-xl md:text-2xl text-neutral-800 pr-2">
              {headline}
            </h2>
            {intakeKey === 'package' && packageName && (
              <p className="text-sm text-neutral-600 mt-1">Package: {packageName}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-greige-light shrink-0" aria-label="Close dialog">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          {doneRef ? (
            <div className="text-center py-6">
              <p className="font-serif text-xl text-neutral-800 mb-2">Thank you!</p>
              <p className="text-sm text-neutral-600 mb-4">
                We received your request. Reference: <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{doneRef}</span>
              </p>
              <p className="text-xs text-neutral-500 mb-6">We&apos;ll follow up within 24–48 business hours.</p>
              {emailNote && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
                  Your request was saved. Email confirmation may have failed: {emailNote}
                </p>
              )}
              <button type="button" className="btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

              <fieldset className="space-y-3 border border-greige-light/80 rounded-xl p-4 bg-white">
                <legend className="text-sm font-semibold text-neutral-800 px-1">Contact</legend>
                <div>
                  <label className="form-label text-xs">Full name *</label>
                  <input className="input-field text-sm" value={contact.fullName} onChange={(e) => setContact((c) => ({ ...c, fullName: e.target.value }))} autoComplete="name" required />
                </div>
                <div>
                  <label className="form-label text-xs">Email *</label>
                  <input className="input-field text-sm" type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} autoComplete="email" required />
                </div>
                <div>
                  <label className="form-label text-xs">Phone *</label>
                  <input className="input-field text-sm" type="tel" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} autoComplete="tel" required />
                </div>
                <div>
                  <label className="form-label text-xs">City / ZIP (optional)</label>
                  <input className="input-field text-sm" value={contact.cityZip} onChange={(e) => setContact((c) => ({ ...c, cityZip: e.target.value }))} autoComplete="address-level2" />
                </div>
              </fieldset>

              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="form-label text-xs" htmlFor={`intake-${field.name}`}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`intake-${field.name}`}
                      className="input-field text-sm min-h-[88px]"
                      rows={field.rows || 3}
                      placeholder={field.placeholder}
                      value={answers[field.name] || ''}
                      onChange={(e) => setAnswer(field.name, e.target.value)}
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`intake-${field.name}`}
                      className="input-field text-sm"
                      value={answers[field.name] ?? ''}
                      onChange={(e) => setAnswer(field.name, e.target.value)}
                      required={field.required}
                    >
                      {(field.options || []).map((o) => (
                        <option key={o.value === '' ? 'empty' : o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`intake-${field.name}`}
                      className="input-field text-sm"
                      type="text"
                      placeholder={field.placeholder}
                      value={answers[field.name] || ''}
                      onChange={(e) => setAnswer(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <button type="submit" disabled={status === 'sending'} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
