import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import BookConsultButton from '../components/BookConsultButton'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import ServiceIntakeModal from '../components/services/ServiceIntakeModal'
import { SERVICE_DETAILS } from '../constants/serviceDetails'
import { SERVICE_PACKAGES } from '../constants/servicePackages'
import { useState, useCallback } from 'react'

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const detail = SERVICE_DETAILS[slug]
  const [intake, setIntake] = useState({ open: false, key: null, packageName: null, headline: null })

  const closeIntake = useCallback(() => {
    setIntake({ open: false, key: null, packageName: null, headline: null })
  }, [])

  if (!detail) {
    return <Navigate to="/services" replace />
  }

  const Icon = detail.icon
  const packages =
    detail.relatedPackages == null
      ? SERVICE_PACKAGES
      : SERVICE_PACKAGES.filter((p) => detail.relatedPackages.includes(p.name))

  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-greige-light/60 bg-gradient-to-b from-white to-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav className="text-sm text-neutral-500 mb-6">
            <Link to="/" className="hover:text-sage">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/services" className="hover:text-sage">
              Services
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">{detail.title}</span>
          </nav>

          <motion.div {...fade}>
            <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-3">{detail.eyebrow}</p>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-muted/45 text-sage-dark flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-neutral-700 text-balance">{detail.title}</h1>
            </div>
            <p className="text-lg md:text-xl text-neutral-700 font-medium mb-4 max-w-2xl">{detail.summary}</p>
            <p className="text-neutral-600 leading-relaxed max-w-2xl mb-8">{detail.heroBody}</p>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  setIntake({
                    open: true,
                    key: detail.intakeKey,
                    packageName: null,
                    headline: `${detail.title} — inquiry`,
                  })
                }
                className="btn-primary"
              >
                {detail.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
              <BookConsultButton variant="modal" className="btn-outline">
                Book a Consultation
              </BookConsultButton>
              <InstagramDmCta className="btn-outline" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-14 bg-white border-b border-greige-light/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 md:gap-14">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-4">Best for</h2>
            <ul className="space-y-3">
              {detail.bestFor.map((line) => (
                <li key={line} className="flex gap-3 text-neutral-600 text-sm md:text-base leading-relaxed">
                  <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-4">What you get</h2>
            <ul className="space-y-3">
              {detail.includes.map((line) => (
                <li key={line} className="flex gap-3 text-neutral-600 text-sm md:text-base leading-relaxed">
                  <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14 border-b border-greige-light/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-6 text-center">How it works</h2>
          <ol className="space-y-5">
            {detail.howItWorks.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sage/20 text-sage-dark text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-neutral-600 pt-1 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {packages.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-b border-greige-light/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-2 text-center">
              {slug === 'packages' ? 'All packages' : 'Related packages'}
            </h2>
            <p className="text-sm text-neutral-500 text-center mb-8">Starting prices — confirm scope after intake.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <article key={pkg.name} className="card border border-greige-light/80 bg-cream/40 p-6 flex flex-col">
                  <div className="flex justify-between gap-3 mb-3">
                    <h3 className="font-serif text-xl text-neutral-700">{pkg.name}</h3>
                    <p className="font-serif text-xl text-sage-dark shrink-0">{pkg.price}</p>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4 flex-1">{pkg.homeBlurb}</p>
                  <button
                    type="button"
                    className="btn-primary w-full text-sm py-3"
                    onClick={() =>
                      setIntake({
                        open: true,
                        key: 'package',
                        packageName: pkg.name,
                        headline: `${pkg.name} — request`,
                      })
                    }
                  >
                    {pkg.bookCtaLabel}
                  </button>
                </article>
              ))}
            </div>
            {slug !== 'packages' && (
              <p className="text-center mt-8">
                <Link to="/services/packages" className="text-sage hover:underline text-sm font-medium">
                  See all packages &amp; pricing →
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Link to="/services" className="text-sm text-neutral-500 hover:text-sage">
            ← Back to all services
          </Link>
        </div>
      </section>

      <PageBottomCta
        headline="Ready to talk through your space?"
        body="Book a consultation or send an inquiry — we will point you to the right package."
        primaryLabel="Book a Consultation"
        primaryTo="/contact#book"
      />

      <ServiceIntakeModal
        open={intake.open}
        onClose={closeIntake}
        intakeKey={intake.key}
        packageName={intake.packageName}
        headlineOverride={intake.headline}
      />
    </div>
  )
}
