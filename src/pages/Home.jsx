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
import { SERVICE_PACKAGES } from '../constants/servicePackages'
import { PORTFOLIO_ITEMS } from '../data/portfolioGallery'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
}

const serviceCards = [
  {
    title: 'Interior Design',
    href: '/services#interior-design',
    icon: Palette,
    bullets: ['Layouts, finishes, and sourcing with one visual thread', 'Virtual express through full-home scope', 'Clear phases — no mystery invoices'],
  },
  {
    title: 'Home Staging',
    href: '/services#home-staging',
    icon: Sofa,
    bullets: ['Walkthroughs that translate to photo day', 'Punch lists buyers actually notice', 'Listing prep that pairs with your timeline'],
  },
  {
    title: 'Real Estate',
    href: '/real-estate',
    icon: Home,
    bullets: ['Tours, offers, and negotiation with context', 'Licensed path through eXp Realty', 'Design + prep in the same conversation'],
  },
]

const differentiators = [
  'Realtor + designer + staging — one table, clear hats',
  'A design eye that lifts perceived value before the offer',
  'Busy-mom friendly: short meetings, honest timelines',
  'Austin / Georgetown market muscle + remote where it fits',
]

export default function HomePage() {
  const previewImages = PORTFOLIO_ITEMS.slice(0, 9)

  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-0">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-cream to-cream border-b border-greige-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Magari &amp; Co.</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] text-neutral-800 mb-4 text-balance">
                Interior Design + Home Staging + Real Estate
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-700 mb-3 font-medium">
                From a dream to your reality 🏡✨
              </p>
              <p className="text-sm font-semibold text-sage-dark tracking-wide mb-6">
                Realtor<sup>®</sup> @ eXp Realty
              </p>
              <p className="text-base text-neutral-600 max-w-xl mb-8 leading-relaxed">
                Staying, listing, or moving: one calm lane for the pretty parts and the paperwork-adjacent parts — with
                labels so you always know who is doing what.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Link to="/contact#book" className="btn-primary text-center inline-flex items-center justify-center gap-2">
                  Book a Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/real-estate"
                  className="btn-outline text-center inline-flex items-center justify-center gap-2"
                >
                  Work With Me (Real Estate)
                </Link>
                <Link to="/portfolio" className="btn-secondary text-center inline-flex items-center justify-center gap-2">
                  View Portfolio
                </Link>
              </div>
              <div className="mt-6">
                <InstagramDmCta className="btn-outline text-center inline-flex items-center justify-center text-sm py-2.5" />
              </div>
              <a href="#lead-magnet" className="inline-block mt-5 text-sm font-medium text-sage-dark hover:underline">
                Free Home Prep Checklist →
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
              Pick a door. Each card links deeper — same voice whether we are sketching furniture or reading a seller
              disclosure.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {serviceCards.map((item, i) => (
              <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.06 }} className="card h-full flex flex-col p-8 border border-greige-light/80 bg-white/95">
                <div className="w-12 h-12 rounded-2xl bg-sage-muted/40 text-sage-dark flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-neutral-700 mb-4">{item.title}</h3>
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
                  className="btn-outline w-full text-center inline-flex items-center justify-center gap-2 text-sm py-3"
                >
                  Learn More
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
            <p className="text-neutral-600 text-sm md:text-base">Starting prices — scope tightens on the consult call.</p>
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
                <p className="text-xs text-neutral-500 mb-2">starting at</p>
                <p className="font-serif text-2xl text-sage-dark mb-4">{pkg.price}</p>
                <p className="text-xs text-sage-dark/90 font-medium mb-4">{pkg.tag}</p>
                <Link to="/contact#book" className="btn-primary w-full text-center text-sm py-3 mt-auto">
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
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Why Magari is different</h2>
            <p className="text-neutral-600 text-sm md:text-base">
              The combo is the product — not an add-on menu you discover halfway through demo day.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {differentiators.map((text, i) => (
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

      {/* 5. Before/After preview */}
      <section className="py-16 md:py-20 bg-cream border-y border-greige-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
            <motion.div {...fadeUp}>
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-2">Before / After preview</h2>
              <p className="text-neutral-600 max-w-xl text-sm md:text-base">
                A peek at the grid — full case studies and filters live on the portfolio page.
              </p>
            </motion.div>
            <Link to="/portfolio" className="btn-outline self-start md:self-auto inline-flex items-center gap-2 shrink-0">
              View Full Portfolio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {previewImages.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="aspect-square rounded-2xl overflow-hidden border border-greige-light bg-neutral-100"
              >
                <img src={img.src} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-4xl text-center text-neutral-700 mb-12">
            Testimonials
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote:
                  'Our listing felt like a home people wanted to linger in — not a showroom. The prep list alone saved us weeks.',
                who: 'Seller · Austin',
              },
              {
                quote:
                  'She speaks design and real estate in the same meeting. We stopped burning Saturdays on houses that would never fit us.',
                who: 'Buyers · Central TX',
              },
              {
                quote:
                  'Virtual express was fast, specific, and shoppable. The living room finally feels done.',
                who: 'Remote client · USA',
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

      {/* 7. Lead magnet */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-cream border-t border-greige-light/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadMagnetForm
            id="lead-magnet"
            title="Free Home Prep Checklist"
            subtitle="Sell faster + make your home look more expensive."
            source="Homepage — Home Prep Checklist"
          />
        </div>
      </section>

      {/* 8. Shop preview */}
      <section className="py-14 md:py-16 bg-white border-y border-greige-light/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 mb-2">Secondary — when you are ready</p>
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-3">Shop Magari</h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Small goods we&apos;d actually place on a shelf — not trend filler. Services stay primary; this is for
                when you want the room to feel finished.
              </p>
              <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Shop Magari
              </Link>
            </div>
            <div className="flex gap-3 flex-1 justify-center lg:justify-end opacity-90">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-sage-muted/35 border border-greige-light" />
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-earth/20 border border-greige-light -mt-4" />
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-taupe-light/50 border border-greige-light" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. MOMade preview */}
      <section className="py-14 md:py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse lg:items-center justify-between gap-8">
            <div className="max-w-xl lg:text-right lg:ml-auto">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 mb-2">Community shelf</p>
              <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-3">MOMade Marketplace</h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Mom-made, human-vetted. Shopping lives at <span className="font-medium text-neutral-700">/momade/shop</span> — this
                preview is just the invite.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Link to="/momade" className="btn-outline inline-flex items-center justify-center gap-2">
                  Explore MOMade
                  <Store className="w-4 h-4" />
                </Link>
                <Link to="/become-a-vendor" className="btn-secondary inline-flex items-center justify-center gap-2">
                  Become a Vendor
                </Link>
              </div>
            </div>
            <div className="flex gap-3 flex-1 justify-center lg:justify-start opacity-90">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-taupe-light/60 border border-greige-light" />
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-sage/15 border border-sage-muted flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-sage" />
              </div>
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-greige-light/80 border border-greige-light -mt-3" />
            </div>
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-14 md:py-16 bg-sage/20 border-t border-sage-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 mb-4">Ready to transform your home?</h2>
            <p className="text-neutral-600 mb-8 max-w-lg mx-auto text-sm md:text-base">
              Send photos, your zip, and what keeps you up at night — we&apos;ll answer with next steps, not a novel.
            </p>
            <Link to="/contact#book" className="btn-primary inline-flex items-center justify-center gap-2 px-10 py-3.5">
              Book Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
