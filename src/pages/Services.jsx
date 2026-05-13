import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Monitor, Footprints, Palette, Check, ArrowRight } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import BookConsultButton from '../components/BookConsultButton'
import ServiceIntakeModal from '../components/services/ServiceIntakeModal'
import { SERVICE_PACKAGES } from '../constants/servicePackages'

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const addOnBullets = [
  'Paint & color palette plan',
  'Shopping list upgrades',
  'Decor sourcing & ordering support',
  'Second room add-on',
  'Photo-day styling support',
]

function ServicePillarCard({ icon: Icon, iconClass, title, children, ctaLabel, onCta }) {
  return (
    <motion.article
      {...fade}
      className="card flex flex-col h-full border border-greige-light/80 bg-white/95 p-6 md:p-7 rounded-2xl"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-neutral-800 mb-3">{title}</h2>
      <div className="text-neutral-600 text-sm leading-relaxed space-y-3 flex-1 mb-5">{children}</div>
      <button type="button" onClick={onCta} className="btn-primary w-full mt-auto py-3 text-sm">
        {ctaLabel}
      </button>
    </motion.article>
  )
}

export default function ServicesPage() {
  const [intake, setIntake] = useState({
    open: false,
    key: null,
    packageName: null,
    headline: null,
  })

  const closeIntake = useCallback(() => {
    setIntake({ open: false, key: null, packageName: null, headline: null })
  }, [])

  const openIntake = useCallback((key, opts = {}) => {
    setIntake({
      open: true,
      key,
      packageName: opts.packageName ?? null,
      headline: opts.headline ?? null,
    })
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative overflow-hidden border-b border-greige-light/60 bg-gradient-to-b from-white to-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-3">Magari &amp; Co.</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-3 text-balance">Services</h1>
          <p className="text-lg text-neutral-700 font-medium mb-4">
            Interior Design • Home Staging • Virtual Styling
          </p>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Magari &amp; Co. offers design-forward services that make your home feel elevated, functional, and ready for
            real life. Choose a package that fits your season — whether you need a quick refresh or a full transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <BookConsultButton variant="modal" className="btn-primary">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </BookConsultButton>
            <a href="/#lead-magnet" className="btn-outline">
              Download Checklist
            </a>
            <InstagramDmCta className="btn-outline" />
          </div>
        </div>
      </section>

      <section className="border-b border-greige-light/50 bg-white py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-sage-dark mb-4 text-center lg:text-left">How we help</p>
          <div className="grid lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            <div id="virtual-design" className="scroll-mt-24">
              <ServicePillarCard
                icon={Monitor}
                iconClass="bg-taupe/20 text-taupe-dark"
                title="Virtual Design"
                ctaLabel="Request Virtual Design"
                onCta={() => openIntake('virtual-design')}
              >
                <p>
                  Perfect if you want a designer&apos;s eye and a clear plan — without in-person meetings. You&apos;ll receive a
                  curated moodboard, layout suggestions, and a shopping list you can use immediately.
                </p>
                <p className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">Best for</p>
                <p className="text-sm">Nurseries, living rooms, bedrooms, rentals, refresh projects.</p>
              </ServicePillarCard>
            </div>

            <div id="interior-design" className="scroll-mt-24">
              <ServicePillarCard
                icon={Palette}
                iconClass="bg-sage-muted/45 text-sage-dark"
                title="Interior Design"
                ctaLabel="Inquire — Interior Design"
                onCta={() => openIntake('interior-design')}
              >
                <p>
                  Full design support for clients who want a cohesive home that feels intentional and beautiful. From layout
                  planning to sourcing, styling, and finishing touches — I help bring the vision to life.
                </p>
              </ServicePillarCard>
            </div>

            <div id="home-staging" className="scroll-mt-24">
              <ServicePillarCard
                icon={Footprints}
                iconClass="bg-earth/15 text-earth-dark"
                title="Home Staging"
                ctaLabel="Inquire — Home Staging"
                onCta={() => openIntake('home-staging')}
              >
                <p>
                  Staging is not just &ldquo;decorating.&rdquo; It&apos;s strategic styling that helps buyers fall in love — and helps
                  sellers win.
                </p>
              </ServicePillarCard>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="bg-cream border-y border-greige-light/40 py-12 md:py-16 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade} className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-2">Packages + pricing</h2>
            <p className="text-sm text-neutral-600">Each button opens a short intake form for that package.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {SERVICE_PACKAGES.map((pkg, i) => (
              <motion.article
                key={pkg.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card flex flex-col h-full border border-greige-light/80 bg-white/95 p-7 md:p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-sage-muted/50 flex items-center justify-center text-sage-dark">
                    <pkg.icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Starting at</p>
                    <p className="font-serif text-3xl text-sage-dark">{pkg.price}</p>
                  </div>
                </div>
                <h3 className="font-serif text-2xl text-neutral-700 mb-3">{pkg.name}</h3>
                <p className="text-sm font-medium text-neutral-800 mb-2">Includes:</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {pkg.packageIncludes.map((b) => (
                    <li key={b} className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
                      <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() =>
                    openIntake('package', {
                      packageName: pkg.name,
                      headline: `${pkg.name} — request`,
                    })
                  }
                  className="btn-primary w-full text-center py-3.5"
                >
                  {pkg.bookCtaLabel}
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="addons" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 scroll-mt-24">
        <motion.div {...fade} className="text-center mb-8">
          <h2 className="font-serif text-3xl text-neutral-700 mb-2">Add-On Services</h2>
        </motion.div>
        <motion.div {...fade} className="card p-7 md:p-8 border border-greige-light/80 bg-white/95">
          <ul className="space-y-3 max-w-xl mx-auto">
            {addOnBullets.map((line) => (
              <li key={line} className="flex gap-3 text-neutral-600 text-sm md:text-base">
                <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>
          <div className="text-center mt-8">
            <button type="button" onClick={() => openIntake('interior-design')} className="btn-outline">
              Ask about add-ons
            </button>
          </div>
        </motion.div>
      </section>

      <section className="bg-white border-t border-greige-light/60 py-12 md:py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Let&apos;s make your home feel like you.</h2>
          <p className="text-neutral-600 mb-6 text-sm md:text-base">
            Prefer to schedule a live consultation? Use the calendar on our contact page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <BookConsultButton variant="modal" className="btn-primary px-10 py-3.5">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </BookConsultButton>
            <Link to="/contact" className="btn-outline px-8 py-3.5">
              Contact form
            </Link>
          </div>
        </div>
      </section>

      <PageBottomCta
        headline="Selling too?"
        body="Pair listing prep with real estate strategy on the Real Estate page — license line stays clear."
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
