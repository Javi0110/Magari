import { MessageCircle } from 'lucide-react'
import { isWhatsAppConfigured, whatsappHref } from '../constants/siteContact'

export default function WhatsAppCta({
  className = 'btn-outline btn-sm inline-flex items-center gap-2',
  children = 'WhatsApp',
  message = 'Hi Elena — I would like to talk about a Magari service.',
  ...rest
}) {
  if (!isWhatsAppConfigured()) return null
  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...rest}
    >
      <MessageCircle className="w-4 h-4" />
      {children}
    </a>
  )
}

export function PreferredContactPicker({ value, onChange, idPrefix = 'pref' }) {
  return (
    <fieldset>
      <legend className="form-label">How should we follow up? *</legend>
      <div className="flex flex-wrap gap-3 mt-1">
        <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="radio"
            name={`${idPrefix}-contact`}
            value="email"
            checked={value === 'email'}
            onChange={() => onChange('email')}
          />
          Email
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="radio"
            name={`${idPrefix}-contact`}
            value="whatsapp"
            checked={value === 'whatsapp'}
            onChange={() => onChange('whatsapp')}
          />
          WhatsApp
        </label>
      </div>
    </fieldset>
  )
}
