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
} from 'lucide-react'
import LeadMagnetForm from '../components/LeadMagnetForm'
import InstagramDmCta from '../components/InstagramDmCta'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-cream to-cream border-b border-greige-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Magari &amp; Co.</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] text-neutral-800 mb-5 text-balance">
                Design, staging, and help buying or selling — without the runaround.
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed max-w-xl mb-3">
                Staying, listing, or house-hunting: we focus on what moves the needle — layout, prep, photos, and
                clear next steps.
              </p>
              <p className="text-base text-neutral-600 max-w-xl mb-8">
                Shop Magari and MOMade when you want to layer in pieces. Consults and packages come first.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Link to="/contact#book" className="btn-primary text-center inline-flex items-center justify-center gap-2">
                  Book a Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/real-estate#buy"
                  className="btn-outline text-center inline-flex items-center justify-center gap-2"
                >
                  Schedule a Buyer Call
                </Link>
                <Link
                  to="/real-estate#sell"
                  className="btn-secondary text-center inline-flex items-center justify-center gap-2"
                >
                  Discuss selling (eXp Realty)
                </Link>
                <InstagramDmCta className="btn-outline text-center inline-flex items-center justify-center" />
              </div>
              <a
                href="#lead-magnet"
                className="inline-block mt-5 text-sm font-medium text-sage-dark hover:underline"
              >
                Download Free Home Prep Checklist →
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

      {/* Services overview */}
      <section className="py-16 md:py-20 bg-white border-b border-greige-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">What we do</h2>
            <p className="text-neutral-600 leading-relaxed">
              Pick an entry point. You&apos;ll get plain-language scope, posted starting prices on packages, and
              steady updates — no mystery phases.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: 'Interior design',
                desc: 'Express virtual refresh through full-room projects — scoped to your budget.',
                href: '/services',
                icon: Palette,
                cta: 'See packages',
              },
              {
                title: 'Home staging',
                desc: 'Walkthroughs, punch lists, and layering so photos and open houses read “finished.”',
                href: '/services#packages',
                icon: Sofa,
                cta: 'Staging options',
              },
              {
                title: 'Real estate',
                desc: 'Buying and selling with Elena, Realtor® @ eXp Realty — plus Magari design in the loop.',
                href: '/real-estate',
                icon: Home,
                cta: 'How it works',
              },
            ].map((item, i) => (
              <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.06 }}>
                <Link
                  to={item.href}
                  className="card h-full flex flex-col p-8 border border-greige-light/80 hover:border-sage-muted transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sage-muted/40 text-sage-dark flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl text-neutral-700 mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-6">{item.desc}</p>
                  <span className="text-sage-dark font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    {item.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/contact#book" className="btn-primary inline-flex items-center gap-2">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Why Magari */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Why people hire us</h2>
            <p className="text-neutral-600">
              One visual direction. Fewer “ask your other person” loops between agent, stager, and designer.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Design, staging, and brokerage questions answered in plain English',
              'Warm minimal — edited, not sparse',
              'Published starting prices on packages (no “TBD” games)',
              'Shop + MOMade stay optional so your project timeline stays sane',
            ].map((text, i) => (
              <motion.div
                key={text}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 rounded-2xl border border-greige-light bg-white/80 p-5"
              >
                <CheckCircle2 className="w-6 h-6 text-sage shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After preview */}
      <section className="py-16 md:py-20 bg-white border-y border-greige-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
            <motion.div {...fadeUp}>
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-2">Before / After</h2>
              <p className="text-neutral-600 max-w-xl">
                Real rooms: calmer layout, better light, layers that photograph. More photography coming soon.
              </p>
            </motion.div>
            <Link to="/portfolio" className="btn-outline self-start md:self-auto inline-flex items-center gap-2">
              Full portfolio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((n) => (
              <motion.div key={n} {...fadeUp} className="grid grid-cols-2 gap-2">
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-greige-light to-greige flex items-center justify-center text-[10px] uppercase tracking-widest text-stone">
                  Before
                </div>
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-sage-muted/50 to-sage/20 flex items-center justify-center text-[10px] uppercase tracking-widest text-sage-dark">
                  After
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-4xl text-center text-neutral-700 mb-12">
            What clients say
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

      {/* Lead magnet */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-cream border-t border-greige-light/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadMagnetForm
            id="lead-magnet"
            title="Free home prep checklist"
            subtitle="A one-page punch list: photos, walk-through flow, quick wins, and what to hand off to a pro."
            source="Homepage — Home Prep Checklist"
          />
        </div>
      </section>

      {/* Shop preview — secondary */}
      <section className="py-14 md:py-16 bg-white border-y border-greige-light/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 mb-2">When you&apos;re ready to shop</p>
              <h2 className="font-serif text-3xl text-neutral-700 mb-3">Shop Magari</h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Decor and small goods we&apos;d actually use on installs — for when you want the room to feel finished,
                not busy.
              </p>
              <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Browse Shop Magari
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

      {/* MOMade preview — secondary */}
      <section className="py-14 md:py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse lg:items-center justify-between gap-8">
            <div className="max-w-xl lg:text-right lg:ml-auto">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500 mb-2">Support mom makers</p>
              <h2 className="font-serif text-3xl text-neutral-700 mb-3">MOMade Marketplace</h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Ceramics, textiles, gifts — mom-made, vetted for quality. Fun add-on; your remodel or listing timeline
                still leads.
              </p>
              <Link to="/momade" className="btn-outline inline-flex items-center gap-2 lg:flex-row-reverse">
                Explore MOMade
                <Store className="w-4 h-4" />
              </Link>
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

      {/* Contact CTA */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Tell us what&apos;s on your plate</h2>
            <p className="text-neutral-600 mb-8 max-w-xl mx-auto leading-relaxed">
              New house, refresh, or listing date on the calendar — we&apos;ll answer with a simple plan and timing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Link to="/contact#book" className="btn-primary inline-flex items-center justify-center gap-2">
                Book a Consultation
              </Link>
              <Link to="/contact" className="btn-outline inline-flex items-center justify-center gap-2">
                Contact
              </Link>
              <InstagramDmCta className="btn-outline inline-flex items-center justify-center" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
