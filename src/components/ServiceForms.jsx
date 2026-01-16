import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  Upload,
  Trash2,
  Info,
  Sparkles,
  CreditCard,
  MailCheck
} from 'lucide-react'
import { sendServiceRequestEmail } from '../utils/emailService'

const CONTACT_STORAGE_KEY = 'magari_saved_contact'

export const AREA_OPTIONS = [
  { id: 'kitchen', label: 'Kitchen', price: 220, helper: 'Ideal for refreshes and layout tweaks.' },
  { id: 'livingRoom', label: 'Living Room', price: 250, helper: 'Create a welcoming social hub.' },
  { id: 'bathroom', label: 'Bathroom', price: 180, helper: 'Polish and elevate your bath retreat.' },
  { id: 'diningRoom', label: 'Dining Room', price: 200, helper: 'Curate unforgettable gathering spaces.' },
  { id: 'bedroom', label: 'Bedroom', price: 200, helper: 'Craft relaxing sleep sanctuaries.' },
  { id: 'patio', label: 'Patio', price: 150, helper: 'Extend your living outdoors.' },
  { id: 'office', label: 'Office', price: 180, helper: 'Boost productivity with thoughtful design.' },
  { id: 'playroom', label: 'Playroom', price: 160, helper: 'Design joyful, functional play spaces.' },
  { id: 'other', label: 'Other', price: 120, helper: 'Describe your unique space so we can tailor a quote.', isCustom: true }
]

export const STYLE_OPTIONS = [
  'Modern',
  'Boho',
  'Minimalist',
  'Farmhouse',
  'Eclectic',
  'Coastal',
  'Scandinavian',
  'Traditional',
  'Transitional',
  'Other'
]

export const BUDGET_OPTIONS = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $2,000',
  '$2,000 – $4,000',
  '$4,000+'
]

const PAYMENT_NOTE = 'Final invoice (remaining 50%) will be due upon delivery of the final design package or installation completion.'

const generateAreaEntryId = () => `entry-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`

const createAreaEntry = () => ({
  id: generateAreaEntryId(),
  nickname: '',
  measurements: { length: '', width: '', height: '' },
  keepNotes: '',
  removeNotes: '',
  unsureNotes: '',
  media: [],
  stylePreference: '',
  budgetRange: ''
})

const createInitialAreas = () => {
  return AREA_OPTIONS.reduce((acc, area) => {
    acc[area.id] = {
      quantity: 0,
      description: '',
      entries: []
    }
    return acc
  }, {})
}

const mediaFromFiles = (files) => {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${Date.now()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    file,
    preview: URL.createObjectURL(file)
  }))
}

const useContactInfo = () => {
  const [contact, setContact] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    saveInfo: false
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTACT_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setContact({ ...parsed, saveInfo: true })
      }
    } catch (error) {
      console.warn('Failed to load saved contact info', error)
    }
  }, [])

  useEffect(() => {
    if (contact.saveInfo) {
      localStorage.setItem(
        CONTACT_STORAGE_KEY,
        JSON.stringify({
          fullName: contact.fullName,
          email: contact.email,
          phone: contact.phone,
          address: contact.address
        })
      )
    } else {
      localStorage.removeItem(CONTACT_STORAGE_KEY)
    }
  }, [contact])

  return [contact, setContact]
}

const ProgressSteps = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="flex items-center justify-between gap-4 text-xs md:text-sm text-neutral-500">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                index < currentStep
                  ? 'border-sage bg-sage text-white'
                  : index === currentStep
                    ? 'border-sage bg-sage/10 text-sage'
                    : 'border-greige-light text-neutral-400'
              }`}
            >
              {index + 1}
            </div>
            <span className="mt-2 text-center leading-tight max-w-[7rem]">{step}</span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-greige-light/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-sage transition-all"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

const AreaQuantitySelector = ({ selections, onChange, priceLabel = 'Base Rate' }) => {
  const handleQuantityChange = (id, quantity) => {
    const safeQuantity = Math.max(0, quantity)
    onChange(id, { ...selections[id], quantity: safeQuantity })
  }

  return (
    <div className="grid gap-4">
      {AREA_OPTIONS.map((area) => (
        <div
          key={area.id}
          className={`rounded-2xl border bg-white shadow-sm transition-all p-4 md:p-5 ${
            selections[area.id]?.quantity > 0 ? 'border-sage shadow-soft' : 'border-transparent'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-neutral-700">{area.label}</p>
              <p className="text-sm text-neutral-500">{area.helper}</p>
              {area.isCustom ? (
                <input
                  type="text"
                  placeholder="Tell us about the space"
                  value={selections[area.id]?.description || ''}
                  onChange={(event) =>
                    onChange(area.id, { ...selections[area.id], description: event.target.value })
                  }
                  className="mt-3 input-field"
                />
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-neutral-500">{priceLabel}</span>
              <span className="text-lg font-semibold text-neutral-700">
                {area.price > 0 ? `$${area.price}` : 'Custom'}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(area.id, selections[area.id]?.quantity - 1)}
                  className="w-9 h-9 rounded-full bg-greige-light/40 flex items-center justify-center text-neutral-600 hover:bg-greige-light"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={selections[area.id]?.quantity || 0}
                  onChange={(event) => handleQuantityChange(area.id, Number(event.target.value))}
                  className="w-12 text-center border rounded-lg py-1 quantity-input"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(area.id, (selections[area.id]?.quantity || 0) + 1)}
                  className="w-9 h-9 rounded-full bg-sage text-white flex items-center justify-center hover:bg-sage/90"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const MediaDropzone = ({ label, description, files, onFilesChange, maxFiles = 5, inputId }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (incomingFiles) => {
    const limited = incomingFiles.slice(0, maxFiles - files.length)
    if (!limited.length) return
    const prepared = mediaFromFiles(limited)
    onFilesChange([...files, ...prepared])
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const incoming = Array.from(event.dataTransfer.files || [])
    handleFiles(incoming)
  }

  const handleBrowse = (event) => {
    const incoming = Array.from(event.target.files || [])
    handleFiles(incoming)
  }

  const removeFile = (id) => {
    const filtered = files.filter((file) => file.id !== id)
    onFilesChange(filtered)
  }

  const controlId = inputId || `file-input-${label.replace(/\s+/g, '-')}`

  return (
    <div className="space-y-3">
      <p className="font-medium text-neutral-700">{label}</p>
      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
          isDragging ? 'border-sage bg-sage/10' : 'border-greige-light'
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto w-10 h-10 text-sage mb-3" />
        <p className="text-sm text-neutral-600">Drag and drop or click to upload up to {maxFiles} files.</p>
        <p className="text-xs text-neutral-400">Images or videos under 1 minute. Max 25MB each.</p>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleBrowse}
          className="hidden"
          id={controlId}
        />
        <label
          htmlFor={controlId}
          className="inline-flex mt-4 px-4 py-2 rounded-full bg-sage text-white text-sm cursor-pointer hover:bg-sage/90"
        >
          Browse files
        </label>
      </div>
      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file) => (
            <div key={file.id} className="relative rounded-xl overflow-hidden bg-neutral-100">
              {file.type.startsWith('image') ? (
                <img src={file.preview} alt={file.name} className="w-full h-28 object-cover" />
              ) : (
                <div className="h-28 flex items-center justify-center text-sm text-neutral-500">
                  <span>{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {description ? <p className="text-xs text-neutral-500">{description}</p> : null}
    </div>
  )
}

const SummarySidebar = ({ title, tagline, lineItems, depositAmount, totalAmount, onTriggerPayment }) => {
  return (
    <aside className="bg-cream rounded-3xl p-6 flex flex-col gap-4 shadow-inner">
      <div>
        <h3 className="font-serif text-2xl text-neutral-700">{title}</h3>
        <p className="text-sm text-neutral-500">{tagline}</p>
      </div>
      <div className="space-y-3">
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between text-sm text-neutral-600">
            <span>{item.label}</span>
            <span className="font-medium text-neutral-700">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-greige-light pt-4 space-y-2">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span className="font-medium text-neutral-700">${totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Deposit Due (50%)</span>
          <span className="font-semibold text-sage">${depositAmount.toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 space-y-3 shadow-soft">
        <p className="text-sm text-neutral-600">Select a payment option to secure your booking instantly.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sage text-white text-sm font-medium hover:bg-sage/90"
            onClick={() => onTriggerPayment('stripe')}
          >
            <CreditCard className="w-4 h-4" />
            Pay with Stripe
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-sage text-sage text-sm font-medium hover:bg-sage/10"
            onClick={() => onTriggerPayment('paypal')}
          >
            <CreditCard className="w-4 h-4" />
            Pay with PayPal
          </button>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">{PAYMENT_NOTE}</p>
      </div>
    </aside>
  )
}

const SuccessState = ({ onClose, headline, body, reference }) => {
  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-sage/10 text-sage flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-3xl text-neutral-700">{headline}</h3>
        <p className="text-neutral-600 max-w-xl mx-auto">{body}</p>
        <p className="text-sm text-neutral-500">Confirmation #{reference}</p>
      </div>
      <div className="bg-cream rounded-3xl p-6 text-left space-y-4">
        <div className="flex items-center gap-3">
          <MailCheck className="w-5 h-5 text-sage" />
          <span className="text-sm text-neutral-500">
            A detailed email with next steps has been sent to you and the Magari & Co. team.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-sage" />
          <span className="text-sm text-neutral-500">
            You&apos;ll receive an automated scheduling invite shortly. After the project wraps, we&apos;ll send a quick review request so you can share your experience.
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-3 rounded-xl bg-sage text-white font-medium hover:bg-sage/90"
      >
        Back to Services
      </button>
    </div>
  )
}

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`

export const VirtualStylingForm = ({ onClose }) => {
  const steps = ['Your Details', 'Spaces & Style', 'Timeline', 'Review & Deposit']
  const [currentStep, setCurrentStep] = useState(0)
  const [contact, setContact] = useContactInfo()
  const [areas, setAreas] = useState(createInitialAreas)
  const [timeline, setTimeline] = useState('4-6 Business Days')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selectedAreas = useMemo(
    () => AREA_OPTIONS.filter((area) => (areas[area.id]?.entries?.length || 0) > 0),
    [areas]
  )

  const subtotal = useMemo(() => {
    return selectedAreas.reduce((total, area) => {
      const count = areas[area.id]?.entries?.length || 0
      return total + area.price * count
    }, 0)
  }, [selectedAreas, areas])

  const deposit = useMemo(() => Math.round(subtotal * 0.5), [subtotal])

  const ensureEntryCount = (entries, desired) => {
    const current = entries || []
    if (desired > current.length) {
      const additions = Array.from({ length: desired - current.length }, () => createAreaEntry())
      return [...current, ...additions]
    }
    if (desired < current.length) {
      return current.slice(0, desired)
    }
    return current
  }

  const handleAreaChange = (id, payload) => {
    setAreas((prev) => {
      const previousArea = prev[id]
      const nextQuantity = payload.quantity !== undefined ? Math.max(0, payload.quantity) : previousArea.entries.length
      const nextEntries = ensureEntryCount(previousArea.entries, nextQuantity)

      return {
        ...prev,
        [id]: {
          ...previousArea,
          ...payload,
          quantity: nextQuantity,
          entries: nextEntries
        }
      }
    })
  }

  const handleEntryChange = (areaId, entryId, updates) => {
    setAreas((prev) => {
      const areaState = prev[areaId]
      const updatedEntries = areaState.entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )

      return {
        ...prev,
        [areaId]: {
          ...areaState,
          entries: updatedEntries,
          quantity: updatedEntries.length
        }
      }
    })
  }

  const buildEntryLabel = (area, entries, entry, index) => {
    const nickname = entry.nickname?.trim()
    if (nickname) return nickname
    if (entries.length > 1) return `${area.label} ${index + 1}`
    return area.label
  }

  const canAdvance = () => {
    if (currentStep === 0) {
      return contact.fullName && contact.email && contact.phone && contact.address
    }
    if (currentStep === 1) {
      return (
        selectedAreas.length > 0 &&
        selectedAreas.every((area) => {
          const entries = areas[area.id]?.entries || []
          return (
            entries.length > 0 &&
            entries.every((entry) => entry.stylePreference && entry.budgetRange)
          )
        })
      )
    }
    return true
  }

  const handleSubmit = async () => {
    const reference = `VS-${Date.now().toString().slice(-6)}`
    const payload = {
      service: 'Virtual Styling',
      contact,
      areas: selectedAreas.map((area) => {
        const areaEntries = areas[area.id].entries
        return {
          id: area.id,
          label: area.label,
          description: areas[area.id].description,
          entries: areaEntries.map((entry, entryIndex) => ({
            entryId: entry.id,
            name: buildEntryLabel(area, areaEntries, entry, entryIndex),
            nickname: entry.nickname,
            measurements: entry.measurements,
            keepNotes: entry.keepNotes,
            removeNotes: entry.removeNotes,
            unsureNotes: entry.unsureNotes,
            mediaCount: entry.media.length,
            stylePreference: entry.stylePreference,
            budgetRange: entry.budgetRange
          }))
        }
      }),
      timeline,
      schedule: { date: scheduleDate, time: scheduleTime },
      subtotal,
      deposit,
      reference
    }

    const existing = JSON.parse(localStorage.getItem('magari_service_requests') || '[]')
    localStorage.setItem('magari_service_requests', JSON.stringify([...existing, payload]))

    // Send confirmation emails
    try {
      await sendServiceRequestEmail(payload)
    } catch (error) {
      console.error('Error sending email:', error)
      // Continue anyway - the request is still saved
    }

    setSubmitted(reference)
  }

  if (submitted) {
    return (
      <SuccessState
        onClose={onClose}
        headline="Virtual Styling Reserved"
        body="Thank you for trusting Magari & Co. We’ll begin curating your personalized digital moodboard and product list right away."
        reference={submitted}
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft overflow-hidden">
        <ProgressSteps steps={steps} currentStep={currentStep} />

        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Tell us about you</h3>
            <p className="text-neutral-500 text-sm max-w-lg">
              We&apos;ll use this information for project updates, scheduling, and payment confirmations.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  className="input-field"
                  value={contact.fullName}
                  onChange={(event) => setContact({ ...contact, fullName: event.target.value })}
                  required
                  placeholder="First & Last Name"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={contact.email}
                  onChange={(event) => setContact({ ...contact, email: event.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  className="input-field"
                  value={contact.phone}
                  onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                  required
                  placeholder="(555) 555-1234"
                />
              </div>
              <div>
                <label className="form-label">Project Address</label>
                <input
                  className="input-field"
                  value={contact.address}
                  onChange={(event) => setContact({ ...contact, address: event.target.value })}
                  required
                  placeholder="Street, City, State"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={contact.saveInfo}
                onChange={(event) => setContact({ ...contact, saveInfo: event.target.checked })}
              />
              Save my info for next project
            </label>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Which spaces are you styling?</h3>
            <p className="text-neutral-500 text-sm max-w-xl">
              Select each area, then tell us the design direction and investment range per space. Upload reference photos or short videos (up to 1 minute each).
            </p>
            <AreaQuantitySelector selections={areas} onChange={handleAreaChange} />
            {selectedAreas.map((area) => {
              const areaState = areas[area.id]
              return areaState.entries.map((entry, entryIndex) => {
                const entryLabel = buildEntryLabel(area, areaState.entries, entry, entryIndex)
                return (
                  <div key={entry.id} className="mt-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-neutral-700">
                          {area.label}
                          {areaState.entries.length > 1 ? ` ${entryIndex + 1}` : ''}
                        </h4>
                        <span className="text-xs text-neutral-500">{areaState.entries.length} selected</span>
                      </div>
                      <input
                        className="input-field"
                        placeholder={area.id === 'other' ? 'Describe this space (e.g., Nursery, Reading Nook)' : 'Nickname this space (optional)'}
                        value={entry.nickname}
                        onChange={(event) => handleEntryChange(area.id, entry.id, { nickname: event.target.value })}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Style for this area</label>
                        <select
                          className="input-field"
                          value={entry.stylePreference}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, { stylePreference: event.target.value })
                          }
                        >
                          <option value="">Select a style</option>
                          {STYLE_OPTIONS.map((style) => (
                            <option key={style} value={style}>
                              {style}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Budget range for this area</label>
                        <select
                          className="input-field"
                          value={entry.budgetRange}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, { budgetRange: event.target.value })
                          }
                        >
                          <option value="">Select a budget</option>
                          {BUDGET_OPTIONS.map((budget) => (
                            <option key={budget} value={budget}>
                              {budget}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Length (ft)</label>
                        <input
                          className="input-field"
                          placeholder="e.g., 15"
                          value={entry.measurements.length}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                length: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Width (ft)</label>
                        <input
                          className="input-field"
                          placeholder="e.g., 12"
                          value={entry.measurements.width}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                width: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Height (ft)</label>
                        <input
                          className="input-field"
                          placeholder="e.g., 9"
                          value={entry.measurements.height}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                height: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                    <MediaDropzone
                      label={`${entryLabel} media uploads`}
                      description="Sube al menos una foto o video corto (máx. 1 min) para este ambiente."
                      inputId={`${area.id}-${entry.id}-decorating`}
                      files={entry.media}
                      onFilesChange={(files) => handleEntryMediaChange(area.id, entry.id, files)}
                    />
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Length (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.length}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                length: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Width (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.width}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                width: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Height (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.height}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                height: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                    <label className="form-label">Items to keep</label>
                    <textarea
                      className="input-field min-h-24"
                      placeholder="Include any existing furniture or decor you’d like to keep."
                      value={entry.keepNotes}
                      onChange={(event) => handleEntryChange(area.id, entry.id, { keepNotes: event.target.value })}
                    />
                    <MediaDropzone
                      label={`${entryLabel} media uploads`}
                      description="Upload up to 5 items per space."
                      inputId={`${area.id}-${entry.id}-virtual`}
                      files={entry.media}
                      onFilesChange={(files) => handleEntryMediaChange(area.id, entry.id, files)}
                    />
                  </div>
                )
              })
            })}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Timeline & kickoff</h3>
            <p className="text-neutral-500 text-sm max-w-xl">
              Tell us how quickly you&apos;d like to receive your moodboard and, if helpful, select a time for a quick kickoff chat.
            </p>
            <label className="form-label">Timeline Preference</label>
            <select
              className="input-field"
              value={timeline}
              onChange={(event) => setTimeline(event.target.value)}
            >
              <option value="4-6 Business Days">4–6 Business Days (Standard)</option>
              <option value="2-3 Business Days">2–3 Business Days (Rush +$80)</option>
              <option value="Flexible">Flexible (We’ll align together)</option>
            </select>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sage" />
                  Schedule a kickoff call (optional)
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                />
              </div>
              <div>
                <label className="form-label flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sage" />
                  Preferred time
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={scheduleTime}
                  onChange={(event) => setScheduleTime(event.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Review & Confirm</h3>
            <div className="bg-cream rounded-3xl p-6 space-y-4">
              <div>
                <p className="font-medium text-neutral-700">Selected Areas & Investment</p>
                <ul className="mt-2 space-y-3 text-sm text-neutral-600">
                  {selectedAreas.map((area) => {
                    const areaEntries = areas[area.id].entries
                    return (
                      <li key={area.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span>{area.label} ×{areaEntries.length}</span>
                          <span>{formatCurrency(area.price * areaEntries.length)}</span>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-500">
                          {areaEntries.map((entry, entryIndex) => {
                            const entryLabel = buildEntryLabel(area, areaEntries, entry, entryIndex)
                            const { length, width, height } = entry.measurements
                            const measurements = [length && `L: ${length}ft`, width && `W: ${width}ft`, height && `H: ${height}ft`]
                              .filter(Boolean)
                              .join(' · ')
                            return (
                              <li key={entry.id} className="space-y-1">
                                <p className="font-medium text-neutral-600">{entryLabel}</p>
                                <p>{entry.stylePreference} • {entry.budgetRange}</p>
                                {measurements ? <p>Measurements: {measurements}</p> : null}
                                {entry.keepNotes ? <p>Keep: {entry.keepNotes}</p> : null}
                                {entry.removeNotes ? <p>Remove: {entry.removeNotes}</p> : null}
                                {entry.unsureNotes ? <p>Unsure: {entry.unsureNotes}</p> : null}
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Timeline & Scheduling</p>
                <p className="text-sm text-neutral-600">
                  Delivery in {timeline}. {scheduleDate ? `Kickoff call on ${scheduleDate} ${scheduleTime ? `at ${scheduleTime}` : ''}.` : 'We will coordinate a call if needed.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              if (currentStep === 0) {
                onClose()
              } else {
                setCurrentStep((step) => Math.max(0, step - 1))
              }
            }}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canAdvance()}
              onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
            >
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              Reserve with Deposit
            </button>
          )}
        </div>
      </div>

      <SummarySidebar
        title="Virtual Styling"
        tagline="Receive a personalized moodboard & shoppable list in 4–6 business days."
        lineItems={selectedAreas.length
          ? selectedAreas.flatMap((area) =>
              areas[area.id].entries.map((entry, index) => ({
                label: buildEntryLabel(area, areas[area.id].entries, entry, index),
                value: formatCurrency(area.price)
              }))
            )
          : [{ label: 'Select one or more areas to see pricing', value: '—' }]}
        depositAmount={deposit}
        totalAmount={subtotal}
        onTriggerPayment={(provider) => {
          console.info(`Trigger ${provider} payment for Virtual Styling`)
        }}
      />
    </div>
  )
}

export const ShoppingStylingForm = ({ onClose }) => {
  const steps = ['Your Details', 'Services & Space', 'Reference Uploads', 'Review & Deposit']
  const [currentStep, setCurrentStep] = useState(0)
  const [contact, setContact] = useContactInfo()
  const [areas, setAreas] = useState(createInitialAreas)
  const [serviceMode, setServiceMode] = useState('full')
  const [measurementVisit, setMeasurementVisit] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const selectedAreas = useMemo(
    () => AREA_OPTIONS.filter((area) => (areas[area.id]?.entries?.length || 0) > 0),
    [areas]
  )

  const subtotal = useMemo(() => {
    const base = selectedAreas.reduce((total, area) => {
      const count = areas[area.id]?.entries?.length || 0
      return total + area.price * count
    }, 0)
    return measurementVisit ? base + 75 : base
  }, [selectedAreas, areas, measurementVisit])

  const deposit = useMemo(() => Math.round(subtotal * 0.5), [subtotal])

  const ensureEntryCount = (entries, desired) => {
    const current = entries || []
    if (desired > current.length) {
      const additions = Array.from({ length: desired - current.length }, () => createAreaEntry())
      return [...current, ...additions]
    }
    if (desired < current.length) {
      return current.slice(0, desired)
    }
    return current
  }

  const handleAreaChange = (id, payload) => {
    setAreas((prev) => {
      const previousArea = prev[id]
      const nextQuantity = payload.quantity !== undefined ? Math.max(0, payload.quantity) : previousArea.entries.length
      const nextEntries = ensureEntryCount(previousArea.entries, nextQuantity)

      return {
        ...prev,
        [id]: {
          ...previousArea,
          ...payload,
          quantity: nextQuantity,
          entries: nextEntries
        }
      }
    })
  }

  const handleEntryChange = (areaId, entryId, updates) => {
    setAreas((prev) => {
      const areaState = prev[areaId]
      const updatedEntries = areaState.entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )

      return {
        ...prev,
        [areaId]: {
          ...areaState,
          entries: updatedEntries,
          quantity: updatedEntries.length
        }
      }
    })
  }

  const handleEntryMediaChange = (areaId, entryId, files) => {
    handleEntryChange(areaId, entryId, { media: files })
  }

  const buildEntryLabel = (area, entries, entry, index) => {
    const nickname = entry.nickname?.trim()
    if (nickname) return nickname
    if (entries.length > 1) return `${area.label} ${index + 1}`
    return area.label
  }

  const canAdvance = () => {
    if (currentStep === 0) {
      return contact.fullName && contact.email && contact.phone && contact.address
    }
    if (currentStep === 1) {
      return selectedAreas.length > 0
    }
    if (currentStep === 2) {
      return (
        selectedAreas.length > 0 &&
        selectedAreas.every((area) => {
          const entries = areas[area.id]?.entries || []
          return (
            entries.length > 0 &&
            entries.every((entry) => entry.stylePreference && entry.budgetRange)
          )
        })
      )
    }
    return true
  }

  const handleSubmit = async () => {
    const reference = `SS-${Date.now().toString().slice(-6)}`
    const payload = {
      service: 'Shopping & Styling',
      contact,
      serviceMode,
      measurementVisit,
      areas: selectedAreas.map((area) => {
        const areaEntries = areas[area.id].entries
        return {
          id: area.id,
          label: area.label,
          description: areas[area.id].description,
          entries: areaEntries.map((entry, entryIndex) => ({
            entryId: entry.id,
            name: buildEntryLabel(area, areaEntries, entry, entryIndex),
            nickname: entry.nickname,
            measurements: entry.measurements,
            mediaCount: entry.media.length,
            stylePreference: entry.stylePreference,
            budgetRange: entry.budgetRange,
            keepNotes: entry.keepNotes,
            removeNotes: entry.removeNotes,
            unsureNotes: entry.unsureNotes
          }))
        }
      }),
      subtotal,
      deposit,
      reference
    }

    const existing = JSON.parse(localStorage.getItem('magari_service_requests') || '[]')
    localStorage.setItem('magari_service_requests', JSON.stringify([...existing, payload]))
    
    // Send confirmation emails
    try {
      await sendServiceRequestEmail(payload)
    } catch (error) {
      console.error('Error sending email:', error)
      // Continue anyway - the request is still saved
    }
    
    setSubmitted(reference)
  }

  if (submitted) {
    return (
      <SuccessState
        onClose={onClose}
        headline="Shopping & Styling Reserved"
        body="Our team will begin sourcing within your budget and prepare your moodboard and shopping list within 4–6 business days."
        reference={submitted}
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft overflow-hidden">
        <ProgressSteps steps={steps} currentStep={currentStep} />

        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Let&apos;s connect</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  className="input-field"
                  value={contact.fullName}
                  onChange={(event) => setContact({ ...contact, fullName: event.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={contact.email}
                  onChange={(event) => setContact({ ...contact, email: event.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  className="input-field"
                  value={contact.phone}
                  onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Project Address</label>
                <input
                  className="input-field"
                  value={contact.address}
                  onChange={(event) => setContact({ ...contact, address: event.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={contact.saveInfo}
                onChange={(event) => setContact({ ...contact, saveInfo: event.target.checked })}
              />
              Save my info for next project
            </label>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Service preferences</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setServiceMode('full')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  serviceMode === 'full' ? 'border-sage bg-sage/10' : 'border-greige-light'
                }`}
              >
                <p className="font-medium text-neutral-700 mb-1">Let Magari handle everything</p>
                <p className="text-sm text-neutral-500">
                  We manage purchases, shipping, and styling within your budget. Items are billed before ordering.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setServiceMode('approval')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  serviceMode === 'approval' ? 'border-sage bg-sage/10' : 'border-greige-light'
                }`}
              >
                <p className="font-medium text-neutral-700 mb-1">Approve each purchase</p>
                <p className="text-sm text-neutral-500">
                  Receive curated recommendations to sign off on. Includes up to 3 revision rounds.
                </p>
              </button>
            </div>
            <div className="flex items-center gap-3 bg-cream rounded-2xl px-4 py-3">
              <input
                type="checkbox"
                checked={measurementVisit}
                onChange={(event) => setMeasurementVisit(event.target.checked)}
              />
              <span className="text-sm text-neutral-600">
                Request in-person measurement visit (+$75)
              </span>
            </div>
            <AreaQuantitySelector selections={areas} onChange={handleAreaChange} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Upload your space</h3>
            <p className="text-neutral-500 text-sm">
              Share photos or videos for each area. Choose the style direction and spending range per space so our sourcing stays on point.
            </p>
            {selectedAreas.map((area) => {
              const areaState = areas[area.id]
              return areaState.entries.map((entry, entryIndex) => {
                const entryLabel = buildEntryLabel(area, areaState.entries, entry, entryIndex)
                return (
                  <div key={entry.id} className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-neutral-700">
                          {area.label}
                          {areaState.entries.length > 1 ? ` ${entryIndex + 1}` : ''}
                        </h4>
                        <span className="text-xs text-neutral-500">{areaState.entries.length} selected</span>
                      </div>
                      <input
                        className="input-field"
                        placeholder={area.id === 'other' ? 'Describe this space (e.g., Pantry, Studio)' : 'Nickname this space (optional)'}
                        value={entry.nickname}
                        onChange={(event) => handleEntryChange(area.id, entry.id, { nickname: event.target.value })}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Style for this area</label>
                        <select
                          className="input-field"
                          value={entry.stylePreference}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, { stylePreference: event.target.value })
                          }
                        >
                          <option value="">Select a style</option>
                          {STYLE_OPTIONS.map((style) => (
                            <option key={style} value={style}>
                              {style}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Budget range for this area</label>
                        <select
                          className="input-field"
                          value={entry.budgetRange}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, { budgetRange: event.target.value })
                          }
                        >
                          <option value="">Select a budget</option>
                          {BUDGET_OPTIONS.map((budget) => (
                            <option key={budget} value={budget}>
                              {budget}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Length (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.length}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                length: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Width (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.width}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                width: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Height (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.height}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                height: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Keep</label>
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Pieces to highlight in this area"
                          value={entry.keepNotes}
                          onChange={(event) => handleEntryChange(area.id, entry.id, { keepNotes: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Remove</label>
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Items to phase out"
                          value={entry.removeNotes}
                          onChange={(event) => handleEntryChange(area.id, entry.id, { removeNotes: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Unsure</label>
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Need our recommendation?"
                          value={entry.unsureNotes}
                          onChange={(event) => handleEntryChange(area.id, entry.id, { unsureNotes: event.target.value })}
                        />
                      </div>
                    </div>
                    <MediaDropzone
                      label={`${entryLabel} references`}
                      description="Photos or video clips under 1 minute."
                      inputId={`${area.id}-${entry.id}-shopping`}
                      files={entry.media}
                      onFilesChange={(files) => handleEntryMediaChange(area.id, entry.id, files)}
                    />
                  </div>
                )
              })
            })}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Review & Confirm</h3>
            <div className="bg-cream rounded-3xl p-6 space-y-4">
              <div>
                <p className="font-medium text-neutral-700">Service Mode</p>
                <p className="text-sm text-neutral-600">
                  {serviceMode === 'full' ? 'Magari handles all purchases and shipping.' : 'You approve each purchase before we order.'}
                </p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Areas</p>
                <ul className="mt-2 space-y-2 text-sm text-neutral-600">
                  {selectedAreas.map((area) => (
                    <li key={area.id} className="flex justify-between">
                      <span>{area.label} ×{areas[area.id].entries.length}</span>
                      <span>{formatCurrency(area.price * areas[area.id].entries.length)}</span>
                    </li>
                  ))}
                  {measurementVisit ? (
                    <li className="flex justify-between">
                      <span>In-person measurement visit</span>
                      <span>$75</span>
                    </li>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Style & Investment by Area</p>
                <ul className="mt-2 space-y-3 text-sm text-neutral-600">
                  {selectedAreas.map((area) => {
                    const areaEntries = areas[area.id].entries
                    return (
                      <li key={area.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span>{area.label} ×{areaEntries.length}</span>
                          <span>{formatCurrency(area.price * areaEntries.length)}</span>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-500">
                          {areaEntries.map((entry, entryIndex) => {
                            const entryLabel = buildEntryLabel(area, areaEntries, entry, entryIndex)
                            const { length, width, height } = entry.measurements
                            const measurements = [length && `L: ${length}ft`, width && `W: ${width}ft`, height && `H: ${height}ft`]
                              .filter(Boolean)
                              .join(' · ')
                            return (
                              <li key={entry.id} className="space-y-1">
                                <p className="font-medium text-neutral-600">{entryLabel}</p>
                                <p>{entry.stylePreference} • {entry.budgetRange}</p>
                                {measurements ? <p>Measurements: {measurements}</p> : null}
                                {entry.keepNotes ? <p>Keep: {entry.keepNotes}</p> : null}
                                {entry.removeNotes ? <p>Remove: {entry.removeNotes}</p> : null}
                                {entry.unsureNotes ? <p>Unsure: {entry.unsureNotes}</p> : null}
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              if (currentStep === 0) {
                onClose()
              } else {
                setCurrentStep((step) => Math.max(0, step - 1))
              }
            }}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canAdvance()}
              onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
            >
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              Reserve with Deposit
            </button>
          )}
        </div>
      </div>

      <SummarySidebar
        title="Shopping & Styling"
        tagline="Curated shopping, coordinated ordering, and styling guidance."
        lineItems={(() => {
          if (!selectedAreas.length) {
            return [{ label: 'Select areas to view pricing', value: '—' }]
          }
          const items = selectedAreas.flatMap((area) =>
            areas[area.id].entries.map((entry, index) => ({
              label: buildEntryLabel(area, areas[area.id].entries, entry, index),
              value: formatCurrency(area.price)
            }))
          )
          if (measurementVisit) {
            items.push({ label: 'Measurement visit', value: '$75' })
          }
          return items
        })()}
        depositAmount={deposit}
        totalAmount={subtotal}
        onTriggerPayment={(provider) => {
          console.info(`Trigger ${provider} payment for Shopping & Styling`)
        }}
      />
    </div>
  )
}

export const DecoratingInstallationForm = ({ onClose }) => {
  const steps = ['Your Details', 'Areas & Install', 'Delivery & Purchase', 'Visit Preference', 'Review & Deposit']
  const [currentStep, setCurrentStep] = useState(0)
  const [contact, setContact] = useContactInfo()
  const [areas, setAreas] = useState(createInitialAreas)
  const [installDays, setInstallDays] = useState(1)
  const [desiredDate, setDesiredDate] = useState('')
  const [deliveryOption, setDeliveryOption] = useState('deliverToHome')
  const [purchaseMethod, setPurchaseMethod] = useState('full')
  const [visitDate, setVisitDate] = useState('')
  const [visitTime, setVisitTime] = useState('')
  const [visitNote, setVisitNote] = useState('')
  const [inPersonVisit, setInPersonVisit] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const selectedAreas = useMemo(
    () => AREA_OPTIONS.filter((area) => (areas[area.id]?.entries?.length || 0) > 0),
    [areas]
  )

  const subtotal = useMemo(() => {
    const areaSubtotal = selectedAreas.reduce((total, area) => {
      const count = areas[area.id]?.entries?.length || 0
      return total + area.price * count
    }, 0)
    const installFee = 250 * installDays
    const visitFee = inPersonVisit ? 75 : 0
    return areaSubtotal + installFee + visitFee
  }, [selectedAreas, areas, installDays, inPersonVisit])

  const deposit = useMemo(() => Math.round(subtotal * 0.5), [subtotal])

  const ensureEntryCount = (entries, desired) => {
    const current = entries || []
    if (desired > current.length) {
      const additions = Array.from({ length: desired - current.length }, () => createAreaEntry())
      return [...current, ...additions]
    }
    if (desired < current.length) {
      return current.slice(0, desired)
    }
    return current
  }

  const handleAreaChange = (id, payload) => {
    setAreas((prev) => {
      const previousArea = prev[id]
      const nextQuantity = payload.quantity !== undefined ? Math.max(0, payload.quantity) : previousArea.entries.length
      const nextEntries = ensureEntryCount(previousArea.entries, nextQuantity)

      return {
        ...prev,
        [id]: {
          ...previousArea,
          ...payload,
          quantity: nextQuantity,
          entries: nextEntries
        }
      }
    })
  }

  const handleEntryChange = (areaId, entryId, updates) => {
    setAreas((prev) => {
      const areaState = prev[areaId]
      const updatedEntries = areaState.entries.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      )

      return {
        ...prev,
        [areaId]: {
          ...areaState,
          entries: updatedEntries,
          quantity: updatedEntries.length
        }
      }
    })
  }

  const handleEntryMediaChange = (areaId, entryId, files) => {
    handleEntryChange(areaId, entryId, { media: files })
  }

  const buildEntryLabel = (area, entries, entry, index) => {
    const nickname = entry.nickname?.trim()
    if (nickname) return nickname
    if (entries.length > 1) return `${area.label} ${index + 1}`
    return area.label
  }

  const canAdvance = () => {
    if (currentStep === 0) {
      return contact.fullName && contact.email && contact.phone && contact.address
    }
    if (currentStep === 1) {
      return (
        selectedAreas.length > 0 &&
        installDays > 0 &&
        selectedAreas.every((area) => {
          const entries = areas[area.id]?.entries || []
          return (
            entries.length > 0 &&
            entries.every((entry) => {
              const hasStyle = entry.stylePreference && entry.budgetRange
              const { length, width, height } = entry.measurements
              const hasMeasurements = inPersonVisit
                ? true
                : Boolean(length.trim() && width.trim() && height.trim())
              const hasMedia = inPersonVisit ? true : (Array.isArray(entry.media) && entry.media.length > 0)
              return hasStyle && hasMeasurements && hasMedia
            })
          )
        })
      )
    }
    if (currentStep === 3) {
      if (inPersonVisit) {
        return visitDate && visitTime
      }
      return true
    }
    return true
  }

  const handleSubmit = async () => {
    if (!inPersonVisit) {
      const missingAssets = selectedAreas.some((area) => {
        const entries = areas[area.id].entries
        return entries.some((entry) => {
          const { length, width, height } = entry.measurements
          const hasMeasurements = Boolean(length.trim() && width.trim() && height.trim())
          const hasMedia = Array.isArray(entry.media) && entry.media.length > 0
          return !(hasMeasurements && hasMedia)
        })
      })

      if (missingAssets) {
        alert('Agrega medidas y al menos una foto o video por espacio, o selecciona la visita en persona.')
        return
      }
    }

    const reference = `DI-${Date.now().toString().slice(-6)}`
    const payload = {
      service: 'Decorating + Installation',
      contact,
      areas: selectedAreas.map((area) => {
        const areaEntries = areas[area.id].entries
        return {
          id: area.id,
          label: area.label,
          description: areas[area.id].description,
          entries: areaEntries.map((entry, entryIndex) => ({
            entryId: entry.id,
            name: buildEntryLabel(area, areaEntries, entry, entryIndex),
            nickname: entry.nickname,
            stylePreference: entry.stylePreference,
            budgetRange: entry.budgetRange,
            keepNotes: entry.keepNotes,
            removeNotes: entry.removeNotes,
            unsureNotes: entry.unsureNotes,
            measurements: entry.measurements,
            mediaCount: entry.media.length
          }))
        }
      }),
      installDays,
      desiredDate,
      deliveryOption,
      purchaseMethod,
      inPersonVisit,
      visitFee: inPersonVisit ? 75 : 0,
      visit: inPersonVisit
        ? { date: visitDate, time: visitTime, note: visitNote, fee: 75 }
        : { remote: true, note: visitNote, fee: 0 },
      subtotal,
      deposit,
      reference
    }

    const existing = JSON.parse(localStorage.getItem('magari_service_requests') || '[]')
    localStorage.setItem('magari_service_requests', JSON.stringify([...existing, payload]))
    
    // Send confirmation emails
    try {
      await sendServiceRequestEmail(payload)
    } catch (error) {
      console.error('Error sending email:', error)
      // Continue anyway - the request is still saved
    }
    
    setSubmitted(reference)
  }

  if (submitted) {
    return (
      <SuccessState
        onClose={onClose}
        headline="Decorating + Installation Reserved"
        body="Your full-service transformation is officially on the books. We will confirm logistics and installation details shortly."
        reference={submitted}
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft overflow-hidden">
        <ProgressSteps steps={steps} currentStep={currentStep} />

        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Project contact</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  className="input-field"
                  value={contact.fullName}
                  onChange={(event) => setContact({ ...contact, fullName: event.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={contact.email}
                  onChange={(event) => setContact({ ...contact, email: event.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  className="input-field"
                  value={contact.phone}
                  onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Service Address</label>
                <input
                  className="input-field"
                  value={contact.address}
                  onChange={(event) => setContact({ ...contact, address: event.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={contact.saveInfo}
                onChange={(event) => setContact({ ...contact, saveInfo: event.target.checked })}
              />
              Save my info for next project
            </label>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Design pricing</h3>
            <p className="text-neutral-500 text-sm">
              Selecciona cada espacio que instalaremos. Verás el precio por área y, si no solicitas visita en persona, necesitarás subir medidas, fotos o videos.
            </p>
            <AreaQuantitySelector selections={areas} onChange={handleAreaChange} priceLabel="Price" />
            {selectedAreas.map((area) => {
              const areaState = areas[area.id]
              return areaState.entries.map((entry, entryIndex) => {
                const entryLabel = buildEntryLabel(area, areaState.entries, entry, entryIndex)
                return (
                  <div key={entry.id} className="space-y-4 bg-cream/60 rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-neutral-700">
                          {area.label}
                          {areaState.entries.length > 1 ? ` ${entryIndex + 1}` : ''}
                        </h4>
                        <span className="text-xs text-neutral-500">{areaState.entries.length} selected</span>
                      </div>
                      <input
                        className="input-field"
                        placeholder={area.id === 'other' ? 'Describe this space (e.g., Nursery, Sunroom)' : 'Nickname this space (optional)'}
                        value={entry.nickname}
                        onChange={(event) => handleEntryChange(area.id, entry.id, { nickname: event.target.value })}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Style for this area</label>
                        <select
                          className="input-field"
                          value={entry.stylePreference}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, { stylePreference: event.target.value })
                          }
                        >
                          <option value="">Select a style</option>
                          {STYLE_OPTIONS.map((style) => (
                            <option key={style} value={style}>
                              {style}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Budget range for this area</label>
                        <select
                          className="input-field"
                          value={entry.budgetRange}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, { budgetRange: event.target.value })
                          }
                        >
                          <option value="">Select a budget</option>
                          {BUDGET_OPTIONS.map((budget) => (
                            <option key={budget} value={budget}>
                              {budget}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Keep</label>
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Pieces staying in this area"
                          value={entry.keepNotes}
                          onChange={(event) => handleEntryChange(area.id, entry.id, { keepNotes: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Remove</label>
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Items we should replace"
                          value={entry.removeNotes}
                          onChange={(event) => handleEntryChange(area.id, entry.id, { removeNotes: event.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Unsure</label>
                        <textarea
                          className="input-field min-h-24"
                          placeholder="Need a second opinion?"
                          value={entry.unsureNotes}
                          onChange={(event) => handleEntryChange(area.id, entry.id, { unsureNotes: event.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Length (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.length}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                length: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Width (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.width}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                width: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label">Height (ft)</label>
                        <input
                          className="input-field"
                          value={entry.measurements.height}
                          onChange={(event) =>
                            handleEntryChange(area.id, entry.id, {
                              measurements: {
                                ...entry.measurements,
                                height: event.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                    <MediaDropzone
                      label={`${entryLabel} media uploads`}
                      description="Sube al menos una foto o video corto (máx. 1 min) para este espacio."
                      inputId={`${area.id}-${entry.id}-installation`}
                      files={entry.media}
                      onFilesChange={(files) => handleEntryMediaChange(area.id, entry.id, files)}
                    />
                  </div>
                )
              })
            })}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Desired install completion date</label>
                <input
                  type="date"
                  className="input-field"
                  value={desiredDate}
                  onChange={(event) => setDesiredDate(event.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Estimated install days</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={installDays}
                  onChange={(event) => setInstallDays(Number(event.target.value) || 1)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Delivery & purchasing</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('deliverToHome')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    deliveryOption === 'deliverToHome' ? 'border-sage bg-sage/10' : 'border-greige-light'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1">Home deliveries</p>
                  <p className="font-medium text-neutral-700">Deliver everything to my home</p>
                  <p className="text-sm text-neutral-500">We stage items as they arrive and store safely until install day.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryOption('bringOnInstall')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    deliveryOption === 'bringOnInstall' ? 'border-sage bg-sage/10' : 'border-greige-light'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1">Install-day staging</p>
                  <p className="font-medium text-neutral-700">Magari brings everything on install day</p>
                  <p className="text-sm text-neutral-500">We manage deliveries behind the scenes and arrive ready to install.</p>
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPurchaseMethod('full')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    purchaseMethod === 'full' ? 'border-sage bg-sage/10' : 'border-greige-light'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1">Full-service purchasing</p>
                  <p className="font-medium text-neutral-700">We handle everything</p>
                  <p className="text-sm text-neutral-500">Our team orders, receives, and installs every piece.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseMethod('approval')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    purchaseMethod === 'approval' ? 'border-sage bg-sage/10' : 'border-greige-light'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1">Collaborative purchasing</p>
                  <p className="font-medium text-neutral-700">Approve each purchase</p>
                  <p className="text-sm text-neutral-500">Review the moodboard and product list before we order.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Visit preference</h3>
            <p className="text-neutral-500 text-sm">
              Choose whether you&apos;d like an in-person walkthrough or prefer to provide detailed visuals remotely.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInPersonVisit(true)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  inPersonVisit ? 'border-sage bg-sage/10' : 'border-greige-light'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1">On-site walkthrough · $75</p>
                <p className="font-medium text-neutral-700">Schedule an in-person visit</p>
                <p className="text-sm text-neutral-500">Incluye toma de medidas, registro fotográfico y planificación logística en tu espacio.</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInPersonVisit(false)
                  setVisitDate('')
                  setVisitTime('')
                }}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  !inPersonVisit ? 'border-sage bg-sage/10' : 'border-greige-light'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1">Virtual kickoff · sin costo</p>
                <p className="font-medium text-neutral-700">Skip the in-person visit</p>
                <p className="text-sm text-neutral-500">Provide measurements, photos, and videos so we can design remotely and keep momentum.</p>
              </button>
            </div>
            {inPersonVisit ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Preferred visit date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={visitDate}
                    onChange={(event) => setVisitDate(event.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Preferred time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={visitTime}
                    onChange={(event) => setVisitTime(event.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-sage/40 bg-sage/5 p-4 text-sm text-neutral-600">
                Perfecto. Usaremos las medidas, fotos y videos que compartiste para preparar el plan de instalación. Si necesitamos más detalles, te contactaremos enseguida.
              </div>
            )}
            <div>
              <label className="form-label">Any access notes?</label>
              <textarea
                className="input-field min-h-24"
                placeholder="Gate codes, parking, pets, o consideraciones adicionales."
                value={visitNote}
                onChange={(event) => setVisitNote(event.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="font-serif text-3xl text-neutral-700">Review & Confirm</h3>
            <div className="bg-cream rounded-3xl p-6 space-y-4">
              <div>
                <p className="font-medium text-neutral-700">Areas</p>
                <ul className="mt-2 space-y-3 text-sm text-neutral-600">
                  {selectedAreas.map((area) => {
                    const areaEntries = areas[area.id].entries
                    return (
                      <li key={area.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>{area.label} ×{areaEntries.length}</span>
                          <span>{formatCurrency(area.price * areaEntries.length)}</span>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-500">
                          {areaEntries.map((entry, entryIndex) => {
                            const entryLabel = buildEntryLabel(area, areaEntries, entry, entryIndex)
                            return (
                              <li key={entry.id} className="space-y-1">
                                <p className="font-medium text-neutral-600">{entryLabel}</p>
                                <p>{entry.stylePreference} • {entry.budgetRange}</p>
                                {entry.keepNotes ? <p>Keep: {entry.keepNotes}</p> : null}
                                {entry.removeNotes ? <p>Remove: {entry.removeNotes}</p> : null}
                                {entry.unsureNotes ? <p>Unsure: {entry.unsureNotes}</p> : null}
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Installation</p>
                <p className="text-sm text-neutral-600">{installDays} day(s) · {formatCurrency(250 * installDays)}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Delivery & purchase</p>
                <p className="text-sm text-neutral-600">
                  {deliveryOption === 'deliverToHome' ? 'Deliver to home as items arrive' : 'Magari brings everything on install day'}
                  {' • '}
                  {purchaseMethod === 'full' ? 'Magari handles all purchasing' : 'Approve each purchase'}
                </p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Visit</p>
                <p className="text-sm text-neutral-600">
                  {inPersonVisit
                    ? `Visita en persona — ${formatCurrency(75)} • ${visitDate || 'fecha por confirmar'}${visitTime ? ` a las ${visitTime}` : ''}`
                    : 'Kickoff virtual con entregables digitales (requiere fotos, videos y medidas)'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              if (currentStep === 0) onClose()
              else setCurrentStep((step) => Math.max(0, step - 1))
            }}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canAdvance()}
              onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
            >
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              Reserve with Deposit
            </button>
          )}
        </div>
      </div>

      <SummarySidebar
        title="Decorating + Installation"
        tagline="Full-service design, purchasing, and professional installation."
        lineItems={(() => {
          if (!selectedAreas.length) {
            return [{ label: 'Select at least one area to view pricing', value: '—' }]
          }
          const items = selectedAreas.flatMap((area) =>
            areas[area.id].entries.map((entry, index) => ({
              label: buildEntryLabel(area, areas[area.id].entries, entry, index),
              value: formatCurrency(area.price)
            }))
          )
          if (inPersonVisit) {
            items.push({ label: 'In-person measurement visit', value: formatCurrency(75) })
          }
          items.push({ label: `Installation (${installDays} day${installDays > 1 ? 's' : ''})`, value: formatCurrency(250 * installDays) })
          return items
        })()}
        depositAmount={deposit}
        totalAmount={subtotal}
        onTriggerPayment={(provider) => {
          console.info(`Trigger ${provider} payment for Decorating + Installation`)
        }}
      />
    </div>
  )
}


