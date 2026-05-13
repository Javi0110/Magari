import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Monitor, Footprints, Palette, Check, ArrowRight } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import BookConsultButton from '../components/BookConsultButton'
import { SERVICE_PACKAGES } from '../constants/servicePackages'

const fade = {
  initial: { opacity: 0, y: 14 },
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

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="relative overflow-hidden border-b border-greige-light/60 bg-gradient-to-b from-white to-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Magari &amp; Co.</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-4 text-balance">Services</h1>
          <p className="text-lg text-neutral-700 font-medium mb-6">
            Interior Design • Home Staging • Virtual Styling
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
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

      <section id="virtual-design" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <motion.div {...fade} className="grid md:grid-cols-[1fr,1.1fr] gap-10 items-start">
          <div className="w-14 h-14 rounded-2xl bg-taupe/20 flex items-center justify-center text-taupe-dark">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Virtual Design</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Perfect if you want a designer&apos;s eye and a clear plan — without in-person meetings. You&apos;ll receive a
              curated moodboard, layout suggestions, and a shopping list you can use immediately.
            </p>
            <p className="text-sm font-medium text-neutral-800 mb-2">Best for:</p>
            <p className="text-sm text-neutral-600">Nurseries, living rooms, bedrooms, rentals, refresh projects.</p>
          </div>
        </motion.div>
      </section>

      <section id="interior-design" className="bg-white border-y border-greige-light/50 py-16 md:py-20 scroll-mt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade} className="grid md:grid-cols-[1fr,1.1fr] gap-10 items-start">
            <div className="w-14 h-14 rounded-2xl bg-sage-muted/45 flex items-center justify-center text-sage-dark md:order-2">
              <Palette className="w-7 h-7" />
            </div>
            <div className="md:order-1">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Interior Design</h2>
              <p className="text-neutral-600 leading-relaxed">
                Full design support for clients who want a cohesive home that feels intentional and beautiful. From layout
                planning to sourcing, styling, and finishing touches — I help bring the vision to life.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="home-staging" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <motion.div {...fade} className="grid md:grid-cols-[1fr,1.1fr] gap-10 items-start">
          <div className="w-14 h-14 rounded-2xl bg-earth/15 flex items-center justify-center text-earth-dark">
            <Footprints className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Home Staging</h2>
            <p className="text-neutral-600 leading-relaxed">
              Staging is not just &ldquo;decorating.&rdquo; It&apos;s strategic styling that helps buyers fall in love — and helps
              sellers win.
            </p>
          </div>
        </motion.div>
      </section>

      <section id="packages" className="bg-cream border-y border-greige-light/40 py-16 md:py-24 scroll-mt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Packages + pricing</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {SERVICE_PACKAGES.map((pkg, i) => (
              <motion.article
                key={pkg.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card flex flex-col h-full border border-greige-light/80 bg-white/95 p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-sage-muted/50 flex items-center justify-center text-sage-dark">
                    <pkg.icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Starting at</p>
                    <p className="font-serif text-3xl text-sage-dark">{pkg.price}</p>
                  </div>
                </div>
                <h3 className="font-serif text-2xl text-neutral-700 mb-4">{pkg.name}</h3>
                <p className="text-sm font-medium text-neutral-800 mb-3">Includes:</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {pkg.packageIncludes.map((b) => (
                    <li key={b} className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
                      <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/contact#book?topic=${encodeURIComponent(pkg.name)}`}
                  className="btn-primary w-full text-center py-3.5"
                >
                  {pkg.bookCtaLabel}
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="addons" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <motion.div {...fade} className="text-center mb-10">
          <h2 className="font-serif text-3xl text-neutral-700 mb-3">Add-On Services</h2>
        </motion.div>
        <motion.div {...fade} className="card p-8 border border-greige-light/80 bg-white/95">
          <ul className="space-y-3 max-w-xl mx-auto">
            {addOnBullets.map((line) => (
              <li key={line} className="flex gap-3 text-neutral-600 text-sm md:text-base">
                <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="bg-white border-t border-greige-light/60 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Let&apos;s make your home feel like you.</h2>
          <p className="text-neutral-600 mb-8 text-sm md:text-base">
            Tell me what you need and I&apos;ll recommend the best package.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <BookConsultButton variant="modal" className="btn-primary px-10 py-3.5">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </BookConsultButton>
          </div>
        </div>
      </section>

      <PageBottomCta
        headline="Selling too?"
        body="Pair listing prep with real estate strategy on the Real Estate page — license line stays clear."
        primaryLabel="Book a Consultation"
        primaryTo="/contact#book"
      />
    </div>
  )
}
