import { Link } from 'react-router-dom'
import InstagramDmCta from './InstagramDmCta'

export default function PageBottomCta({
  headline = 'Ready for the next step?',
  body = null,
  primaryLabel = 'Book a Consultation',
  primaryTo = '/contact#book',
  showChecklist = true,
}) {
  return (
    <section className="py-14 md:py-16 border-t border-greige-light/60 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl text-neutral-700 mb-3">{headline}</h2>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          {body ??
            'Tell us what you need — we typically reply within 24–48 business hours. For quick questions, message us on Instagram.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          <Link to={primaryTo} className="btn-primary inline-flex items-center justify-center gap-2">
            {primaryLabel}
          </Link>
          {showChecklist && (
            <a href="/#lead-magnet" className="btn-outline inline-flex items-center justify-center">
              Free Home Prep Checklist
            </a>
          )}
          <InstagramDmCta className="btn-outline inline-flex items-center justify-center text-center" />
        </div>
      </div>
    </section>
  )
}
