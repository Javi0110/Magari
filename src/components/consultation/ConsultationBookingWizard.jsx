import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronRight, ChevronLeft, Check, Loader2, Clock, MapPin } from 'lucide-react'
import {
  BOOKING_TIMEZONE_LABEL,
  CONSULTATION_SERVICE_TYPES,
  labelForServiceType,
} from '../../constants/consultationBooking'
import {
  fetchPublicAvailableSlots,
  submitConsultationRequest,
  groupSlotsByChicagoDay,
  formatTimeRange,
} from '../../utils/consultationBooking'
import { notifyConsultationBooked } from '../../utils/emailService'

const steps = [
  { id: 1, title: 'Service' },
  { id: 2, title: 'Date & time' },
  { id: 3, title: 'Your details' },
]

function StepHeader({ step }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              step >= s.id ? 'bg-sage text-white' : 'bg-greige-light text-neutral-500'
            }`}
          >
            {step > s.id ? <Check className="w-4 h-4" /> : s.id}
          </div>
          <span
            className={`ml-2 text-xs sm:text-sm font-medium truncate ${
              step === s.id ? 'text-sage-dark' : 'text-neutral-500'
            }`}
          >
            {s.title}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-greige shrink-0 mx-1 hidden sm:block" aria-hidden />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ConsultationBookingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [serviceType, setServiceType] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsError, setSlotsError] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true)
    setSlotsError(null)
    const { data, error } = await fetchPublicAvailableSlots()
    setSlotsLoading(false)
    if (error) {
      setSlotsError(error.message || 'Could not load availability.')
      setSlots([])
      return
    }
    setSlots(data || [])
  }, [])

  useEffect(() => {
    if (step >= 2) loadSlots()
  }, [step, loadSlots])

  const grouped = useMemo(() => groupSlotsByChicagoDay(slots), [slots])
  const [selectedDayKey, setSelectedDayKey] = useState(null)

  useEffect(() => {
    if (grouped.length === 0) {
      setSelectedDayKey(null)
      return
    }
    setSelectedDayKey((prev) => {
      if (prev && grouped.some((g) => g.dateKey === prev)) return prev
      return grouped[0].dateKey
    })
  }, [grouped])

  const daySlots = useMemo(() => {
    const g = grouped.find((x) => x.dateKey === selectedDayKey)
    return g?.slots ?? []
  }, [grouped, selectedDayKey])

  const selectDay = (key) => {
    setSelectedDayKey(key)
    setSelectedSlot((current) => {
      if (!current) return null
      const nextDay = grouped.find((g) => g.dateKey === key)
      if (nextDay?.slots.some((s) => s.id === current.id)) return current
      return null
    })
  }

  const canNext1 = !!serviceType
  const canNext2 = !!selectedSlot
  const canSubmit =
    fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    selectedSlot &&
    serviceType

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!canSubmit) return
    setSubmitting(true)
    const { data, error } = await submitConsultationRequest({
      slotId: selectedSlot.id,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      serviceType,
      message: message.trim(),
    })
    setSubmitting(false)
    if (error) {
      const msg = String(error.message || error.details || '')
      if (msg.includes('slot_unavailable') || msg.includes('slot_taken')) {
        setFormError('That time was just taken. Please choose another slot.')
        loadSlots()
        setSelectedSlot(null)
        setStep(2)
      } else if (msg.includes('slot_already_booked')) {
        setFormError('Double booking prevented — pick another slot.')
        loadSlots()
        setSelectedSlot(null)
        setStep(2)
      } else {
        setFormError(msg || 'Something went wrong. Please try again.')
      }
      return
    }

    const resolvedId = typeof data === 'string' ? data : data?.id ?? data?.[0] ?? null
    const summary = {
      serviceLabel: labelForServiceType(serviceType),
      slotLabel: formatTimeRange(selectedSlot),
      requestId: resolvedId,
    }
    notifyConsultationBooked({
      guestName: fullName.trim(),
      guestEmail: email.trim(),
      serviceLabel: summary.serviceLabel,
      slotLabel: summary.slotLabel,
      requestId: resolvedId,
    }).catch(() => {})

    navigate('/contact/success', { replace: false, state: summary })
  }

  return (
    <div className="rounded-2xl border border-greige-light/90 bg-white/95 p-6 sm:p-8 shadow-none">
      <div className="flex items-start gap-3 mb-2">
        <div className="rounded-xl bg-sage/10 p-2.5 text-sage">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-neutral-800 tracking-tight">Request a consultation</h2>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Times shown in <span className="font-medium text-neutral-600">{BOOKING_TIMEZONE_LABEL}</span>
          </p>
        </div>
      </div>

      <StepHeader step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <label className="form-label">What would you like to discuss?</label>
            <select
              className="input-field w-full"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            >
              <option value="">Select a service…</option>
              {CONSULTATION_SERVICE_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!canNext1}
              onClick={() => setStep(2)}
              className="btn-primary btn-block mt-4 disabled:opacity-40"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 min-h-0"
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-sage-dark hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-16 text-neutral-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading openings…
              </div>
            ) : slotsError ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-4">{slotsError}</p>
            ) : grouped.length === 0 ? (
              <p className="text-sm text-neutral-600 bg-cream border border-greige-light rounded-xl p-4">
                No open slots right now. Email{' '}
                <a href="mailto:magaribyelena@gmail.com" className="text-sage-dark font-medium underline">
                  magaribyelena@gmail.com
                </a>{' '}
                and we&apos;ll follow up.
              </p>
            ) : (
              <>
                <p className="text-xs text-neutral-500 shrink-0">
                  Pick a day, then a time. Swipe the date row sideways if there are many days.
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 shrink-0 overscroll-x-contain touch-pan-x">
                  {grouped.map(({ dateKey, label }) => {
                    const active = selectedDayKey === dateKey
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => selectDay(dateKey)}
                        className={`shrink-0 rounded-xl px-3 py-2 text-left text-sm font-medium border transition-all max-w-[11rem] ${
                          active
                            ? 'border-sage bg-sage text-white shadow-sm'
                            : 'border-greige-light bg-white text-neutral-700 hover:border-sage-muted hover:bg-sage-muted/10'
                        }`}
                      >
                        <span className="block text-xs font-normal opacity-90 line-clamp-2">{label}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="rounded-xl border border-greige-light/80 bg-cream/30 min-h-0 max-h-[min(42dvh,320px)] overflow-y-auto overscroll-y-contain px-3 py-3 -mx-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 sticky top-0 bg-cream/95 backdrop-blur-sm py-1 -mt-1">
                    Times this day
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => {
                      const active = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-full px-3.5 py-2 text-sm font-medium border transition-all ${
                            active
                              ? 'border-sage bg-sage text-white shadow-sm'
                              : 'border-greige-light bg-white text-neutral-700 hover:border-sage-muted hover:bg-sage-muted/10'
                          }`}
                        >
                          {new Date(slot.start_time).toLocaleTimeString('en-US', {
                            timeZone: 'America/Chicago',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' – '}
                          {new Date(slot.end_time).toLocaleTimeString('en-US', {
                            timeZone: 'America/Chicago',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2 mt-auto shrink-0 border-t border-greige-light/70 bg-white/95">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                Back
              </button>
              <button
                type="button"
                disabled={!canNext2 || slotsLoading || grouped.length === 0}
                onClick={() => setStep(3)}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.form
            key="s3"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-sage-dark hover:underline inline-flex items-center gap-1 mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="rounded-xl border border-sage-muted/50 bg-sage-muted/5 px-4 py-3 text-sm text-neutral-700 mb-4">
              <p className="font-medium text-sage-dark">{labelForServiceType(serviceType)}</p>
              <p className="text-neutral-600 mt-1 flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-sage" aria-hidden />
                {formatTimeRange(selectedSlot)}
              </p>
            </div>

            {formError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>
            )}

            <div>
              <label className="form-label">Full name *</label>
              <input
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="form-label">Message <span className="font-normal text-neutral-400">(optional)</span></label>
              <textarea
                className="input-field min-h-24"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Project address, timeline, or questions…"
              />
            </div>

            <button type="submit" disabled={!canSubmit || submitting} className="btn-primary btn-block disabled:opacity-50">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit request
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
