import { useMemo } from 'react'
import { getCalendlyEmbedUrl } from '../constants/calendly'

export default function CalendlyIframe({ className = '', title = 'Schedule a consultation — Calendly' }) {
  const src = useMemo(() => getCalendlyEmbedUrl(), [])

  return (
    <iframe
      title={title}
      src={src}
      className={`w-full min-h-[620px] md:min-h-[700px] rounded-2xl border border-greige-light bg-white ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
