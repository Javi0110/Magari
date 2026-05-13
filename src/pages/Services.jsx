import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Monitor,
  Footprints,
  Sparkles,
  Palette,
  Check,
  ArrowRight,
} from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import MiniBookingForm from '../components/MiniBookingForm'
import PageBottomCta from '../components/PageBottomCta'

const packages = [
  {
    name: 'Virtual Design Express',
    price: '$299',
    tag: 'Remote · fast turnaround',
    icon: Monitor,
    bullets: [
      'Direction board + shoppable links',
      'One revision pass',
      'Best for a single room reset',
    ],
  },
  {
    name: 'Staging Walkthrough Consultation',
    price: '$250',
    tag: 'On-site or virtual walkthrough',
    icon: Footprints,
    bullets: [
      'Room-by-room priorities',
      'Photo-day punch list',
      'Vendor-neutral — act on it yourself or hire out',
    ],
  },
  {
    name: 'Listing Prep Package',
    price: '$850',
    tag: 'Get market-ready',
    icon: Sparkles,
    bullets: [
      'Seller prep roadmap',
      'Show-ready styling notes',
      'Built to support a clean launch week',
    ],
  },
  {
    name: 'Full Interior Design Projects',
    price: '$1,800',
    tag: 'Starting investment',
    icon: Palette,
    bullets: [
      'Concept through install support',
      'Layouts, finishes, sourcing',
      'Primary homes + select short-term rentals',
    ],
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="relative overflow-hidden border-b border-greige-light/60 bg-gradient-to-b from-white to-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Magari &amp; Co.</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">
            Design, staging, and listing prep — priced where you can start.
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4">
            Tell us the room or the deadline. We&apos;ll match you to a package or build a short custom scope.
          </p>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto mb-10">
            No jargon decks — you leave with a written plan you can execute or hand to a contractor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/contact#book" className="btn-primary inline-flex items-center justify-center gap-2">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="/#lead-magnet" className="btn-outline inline-flex items-center justify-center">
              Download Free Home Prep Checklist
            </a>
            <InstagramDmCta className="btn-outline inline-flex items-center justify-center" />
          </div>
        </div>
      </section>

      <section id="packages" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {packages.map((pkg, i) => (
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
              <h2 className="font-serif text-2xl text-neutral-700 mb-2">{pkg.name}</h2>
              <p className="text-sm text-sage-dark font-medium mb-6">{pkg.tag}</p>
              <ul className="space-y-3 flex-1 mb-8">
                {pkg.bullets.map((b) => (
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
                Book this package
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 mb-16">
          <MiniBookingForm pageLabel="Services" id="quick-book-services" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-neutral-600 mb-4 max-w-xl mx-auto text-sm md:text-base">
            Between packages? Book a consult — we&apos;ll point you to the right door.
          </p>
          <Link to="/real-estate" className="text-sage-dark font-medium hover:underline">
            Buying or selling → see real estate (eXp Realty) + design together
          </Link>
        </div>
      </section>

      <PageBottomCta
        headline="Next step: pick a time"
        body="Book a consult, grab the free prep checklist, or DM us on Instagram — whatever is fastest for you."
      />
    </div>
  )
}
