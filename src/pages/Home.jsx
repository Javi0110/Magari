import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Palette,
  Sofa,
  Home,
  Store,
  Sparkles,
  Quote,
  CheckCircle2,
  ShoppingBag,
  Check,
} from 'lucide-react'
import LeadMagnetForm from '../components/LeadMagnetForm'
import InstagramDmCta from '../components/InstagramDmCta'
import BookConsultButton from '../components/BookConsultButton'
import { SERVICE_PACKAGES } from '../constants/servicePackages'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
}

const serviceCards = [
  {
    title: 'Interior Design',
    text: 'Design that feels warm, timeless, and functional — made for real life.',
    href: '/services#interior-design',
    icon: Palette,
    cta: 'Explore Design',
    bullets: ['Full-room transformations', 'Custom styling + sourcing', 'Layout & space planning'],
  },
  {
    title: 'Home Staging',
    text: 'Sell faster and for more by making your home feel irresistible to buyers.',
    href: '/services#home-staging',
    icon: Sofa,
    cta: 'Explore Staging',
    bullets: ['Walkthrough consultations', 'Listing prep + styling', 'Photo-ready spaces'],
  },
  {
    title: 'Real Estate',
    text: 'Buyer and seller representation with Elena Fadhel, Realtor® @ eXp Realty — paired with Magari design and staging. Magari & Co. is not a brokerage.',
    href: '/real-estate',
    icon: Home,
    cta: 'Elena @ eXp Realty',
    bullets: ['Buyer representation', 'Seller strategy + prep', 'Offer & negotiation support'],
  },
]

const differentiatorBullets = [
  'Licensed Realtor® (eXp Realty) + design studio — roles disclosed',
  'Styling that increases perceived value',
  'Simple process, clear steps, no overwhelm',
  'Personalized support from start to finish',
  'Georgetown + Austin market knowledge',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-0">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-cream to-cream border-b border-greige-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Magari &amp; Co.</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] text-neutral-800 mb-4 text-balance">
                From a dream to your reality 🏡✨
              </h1>
              <p className="text-lg sm:text-xl text-neutral-700 mb-4 font-medium tracking-wide">
                Interior Design • Home Staging • Real Estate
              </p>
              <p className="text-sm text-neutral-600 mb-6">
                <span className="font-semibold text-sage-dark">
                  Realtor<sup>®</sup> @ eXp Realty
                </span>
                <span className="text-neutral-500"> | </span>
                Serving Georgetown + Austin, TX
              </p>
              <p className="text-base text-neutral-600 max-w-xl mb-4 leading-relaxed">
                Magari &amp; Co. is the design and staging studio. Licensed real estate is a separate service: Elena Fadhel,
                Realtor<sup>®</sup> @ eXp Realty, for buying and selling — so you can refresh, stage, list, or shop with
                clear lines between the studio and the brokerage relationship.
              </p>
              <p className="text-xs text-neutral-500 max-w-xl mb-8 leading-relaxed">
                Magari &amp; Co. does not hold a real estate license and is not a brokerage.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <BookConsultButton
                  variant="modal"
                  className="btn-primary"
                >
                  Book a Consultation
                  <ArrowRight className="w-4 h-4" />
                </BookConsultButton>
                <Link
                  to="/real-estate"
                  className="btn-outline"
                >
                  Real estate (eXp Realty)
                </Link>
              </div>
              <div className="mt-6">
                <InstagramDmCta className="btn-outline btn-sm" />
              </div>
              <a href="#lead-magnet" className="inline-block mt-5 text-sm font-medium text-sage-dark hover:underline">
                Download Checklist →
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="relative aspect-[4/5] max-h-[520px] rounded-3xl overflow-hidden border border-greige-light bg-neutral-100 shadow-soft-lg mx-auto w-full max-w-md lg:max-w-none"
            >
              <img
                src="/hero-image.jpeg"
                alt="Warm, minimal interior by Magari and Co."
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-black/45 via-black/10 to-transparent">
                <p className="text-white/95 font-serif text-xl md:text-2xl leading-snug">
                  Warm, modern, lived-in — on purpose.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Services overview */}
      <section className="py-16 md:py-20 bg-white border-b border-greige-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Services overview</h2>
            <p className="text-neutral-600 leading-relaxed">
              Three ways we work together — tap through for packages and pricing.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {serviceCards.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ delay: i * 0.06 }}
                className="card h-full flex flex-col p-8 border border-greige-light/80 bg-white/95"
              >
                <div className="w-12 h-12 rounded-2xl bg-sage-muted/40 text-sage-dark flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-neutral-700 mb-3">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-5">{item.text}</p>
                <ul className="space-y-2.5 text-sm text-neutral-600 flex-1 mb-6">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={item.href}
                  className="btn-outline btn-block text-sm py-3"
                >
                  {item.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured packages */}
      <section className="py-16 md:py-20 bg-cream border-b border-greige-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Featured packages</h2>
            <p className="text-neutral-600 text-sm md:text-base">Starting prices — we confirm scope on your consult call.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICE_PACKAGES.map((pkg, i) => (
              <motion.article
                key={pkg.name}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                className="card flex flex-col p-6 border border-greige-light/80 bg-white/95 h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-muted/45 flex items-center justify-center text-sage-dark mb-4">
                  <pkg.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-neutral-800 mb-1 leading-snug">{pkg.name}</h3>
                <p className="text-xs text-neutral-500 mb-1">Starting at</p>
                <p className="font-serif text-2xl text-sage-dark mb-3">{pkg.price}</p>
                <p className="text-sm text-neutral-600 leading-relaxed flex-1 mb-5">{pkg.homeBlurb}</p>
                <Link
                  to={`/contact#book?topic=${encodeURIComponent(pkg.name)}`}
                  className="btn-primary btn-block text-sm py-3 mt-auto"
                >
                  Book Now
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Magari */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">
              Design-driven. Market-smart. Made for real life.
            </h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Most people hire a designer <em>or</em> a Realtor<sup>®</sup>. Here you can work with the same person for
              both: interiors and staging through Magari &amp; Co., and transaction representation as Elena Fadhel,
              Realtor<sup>®</sup> @ eXp Realty — always labeled so you know which hat applies.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {differentiatorBullets.map((text, i) => (
              <motion.div
                key={text}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 rounded-2xl border border-greige-light bg-cream/80 p-5 md:p-6"
              >
                <CheckCircle2 className="w-6 h-6 text-sage shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-4xl text-center text-neutral-700 mb-12">
            Testimonials
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: 'Elena has the eye. She made my space feel high-end without blowing the budget.',
                who: 'Client',
              },
              {
                quote: 'She understood exactly what I wanted and gave me a clear plan. No stress, just results.',
                who: 'Client',
              },
              {
                quote: 'My home looked completely different after her staging consult. Worth every dollar.',
                who: 'Client',
              },
            ].map((t, i) => (
              <motion.figure
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="card p-8 border border-greige-light/80 relative"
              >
                <Quote className="w-8 h-8 text-sage-muted mb-4 opacity-80" aria-hidden />
                <blockquote className="text-neutral-600 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="text-xs font-medium text-sage-dark uppercase tracking-wider">{t.who}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lead magnet */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-cream border-t border-greige-light/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadMagnetForm
            id="lead-magnet"
            title="Free Home Prep Checklist"
            subtitle="Want your home to look more expensive (without spending a fortune)? Download my checklist with the exact steps I use to prepare homes for showings and photos."
            source="Homepage — Home Prep Checklist"
            submitButtonLabel="Download Checklist"
            successDownloadButtonLabel="Download Checklist"
            disclaimer="By submitting, you agree to receive emails from Magari & Co. (no spam, promise)."
          />
        </div>
      </section>

      {/* 7–8. Secondary: Shop + MOMade — after services path + lead magnet; not in hero */}
      <section className="bg-gradient-to-b from-cream to-white border-t border-greige-light/60 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 text-center mb-10 md:mb-12">
            Shop &amp; MOMade — when you&apos;re ready (after your plan or consult)
          </p>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="border-b border-greige-light/60 pb-10 lg:border-b-0 lg:pb-0 lg:pr-8 lg:border-r border-greige-light/50">
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-3">Shop Magari</h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 max-w-md">
                Curated home finds, handmade pieces, and favorites that feel like Magari.
              </p>
              <Link to="/shop" className="btn-outline">
                <ShoppingBag className="w-4 h-4" />
                Shop Magari
              </Link>
              <div className="flex gap-3 mt-8 justify-start opacity-85">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-sage-muted/35 border border-greige-light/80" />
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-earth/20 border border-greige-light/80 -mt-2" />
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-taupe-light/50 border border-greige-light/80" />
              </div>
            </div>
            <div className="pt-2 lg:pt-0 lg:pl-2">
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-3 lg:text-right">MOMade Marketplace</h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6 max-w-md lg:ml-auto lg:text-right">
                A marketplace made by moms, for moms. Supporting small businesses and beautiful handmade finds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Link to="/momade" className="btn-outline">
                  Explore MOMade
                  <Store className="w-4 h-4" />
                </Link>
                <Link to="/become-a-vendor" className="btn-secondary">
                  Become a Vendor
                </Link>
              </div>
              <div className="flex gap-3 mt-8 justify-center lg:justify-end opacity-85">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-taupe-light/60 border border-greige-light/80" />
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-sage/15 border border-sage-muted flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-sage" />
                </div>
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-greige-light/80 border border-greige-light/80 -mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-14 md:py-16 bg-sage/20 border-t border-sage-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 mb-4">Ready to transform your home?</h2>
            <p className="text-neutral-600 mb-8 max-w-lg mx-auto text-sm md:text-base">
              Design and staging through Magari &amp; Co.; buying and selling with Elena Fadhel, Realtor<sup>®</sup> @ eXp
              Realty — one contact, two clearly separated service lines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <BookConsultButton
                variant="modal"
                className="btn-primary px-10 py-3.5"
              >
                Book a Consultation
                <ArrowRight className="w-4 h-4" />
              </BookConsultButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
