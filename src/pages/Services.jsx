import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Monitor, Footprints, Palette, Check, ArrowRight, ListChecks, Paintbrush, Link2 } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import { SERVICE_PACKAGES } from '../constants/servicePackages'

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const addOns = [
  { title: 'Shopping list', desc: 'Clickable picks sized to your budget — buy now or phase in.', icon: ListChecks },
  { title: 'Paint + color palette', desc: 'Walls that cooperate with your light + floors.', icon: Paintbrush },
  { title: 'Sourcing links', desc: 'No treasure hunt; we send the tabs that actually ship.', icon: Link2 },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-greige-light/60 bg-gradient-to-b from-white to-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Magari &amp; Co.</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">Services</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4">
            Interiors, staging, and virtual packages with posted starting prices. Plain-language scope — you leave with a
            plan you can run or hand off.
          </p>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto mb-10">
            Real estate licensing lives on the Real Estate page (eXp Realty). This lane is design + prep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/contact#book" className="btn-primary inline-flex items-center justify-center gap-2">
              Book Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact#book" className="btn-outline inline-flex items-center justify-center gap-2">
              Ask a Question
            </Link>
            <a href="/#lead-magnet" className="btn-outline inline-flex items-center justify-center">
              Free Home Prep Checklist
            </a>
            <InstagramDmCta className="btn-outline inline-flex items-center justify-center" />
          </div>
        </div>
      </section>

      {/* 2. Interior Design */}
      <section id="interior-design" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <motion.div {...fade} className="grid md:grid-cols-[1fr,1.1fr] gap-10 items-start">
          <div className="w-14 h-14 rounded-2xl bg-sage-muted/45 flex items-center justify-center text-sage-dark">
            <Palette className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Interior Design Services</h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              From a single stuck room to a full home — layouts, finishes, furniture plans, and install support. We
              edit hard so your spend reads intentional, not scattered.
            </p>
            <ul className="space-y-3">
              {['Concept through install (as much or as little as you want)', 'Sourcing that respects lead times', 'Short-term rentals when the calendar allows'].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* 3. Home Staging */}
      <section id="home-staging" className="bg-white border-y border-greige-light/50 py-16 md:py-20 scroll-mt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade} className="grid md:grid-cols-[1fr,1.1fr] gap-10 items-start">
            <div className="w-14 h-14 rounded-2xl bg-earth/15 flex items-center justify-center text-earth-dark md:order-2">
              <Footprints className="w-7 h-7" />
            </div>
            <div className="md:order-1">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Home Staging Services</h2>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Walkthroughs, punch lists, and layering notes so MLS photos and open houses feel finished — not
                “we will fix it later.”
              </p>
              <ul className="space-y-3">
                {['On-site or virtual walkthrough options', 'Photo-day priorities called out in order', 'Pairs cleanly with listing prep + Realtor timelines'].map((t) => (
                  <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                    <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Virtual Design */}
      <section id="virtual-design" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <motion.div {...fade} className="grid md:grid-cols-[1fr,1.1fr] gap-10 items-start">
          <div className="w-14 h-14 rounded-2xl bg-taupe/20 flex items-center justify-center text-taupe-dark">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Virtual Design Services</h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Fast direction when you are not local — or when you just need the vision before you touch a paint can.
              Boards, links, one revision pass on express.
            </p>
            <ul className="space-y-3">
              {['Shoppable layers you can execute on your weekend', 'Clear deliverables + turnaround expectations', 'Great bridge before a larger install'].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* 5. Packages */}
      <section id="packages" className="bg-cream border-y border-greige-light/40 py-16 md:py-24 scroll-mt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fade} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">Packages + pricing</h2>
            <p className="text-neutral-600 text-sm md:text-base">Starting at — final quote after we see photos and scope.</p>
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
                <h3 className="font-serif text-2xl text-neutral-700 mb-2">{pkg.name}</h3>
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
                  Book Now
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Add-ons */}
      <section id="addons" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-28">
        <motion.div {...fade} className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-serif text-3xl text-neutral-700 mb-3">Add-ons</h2>
          <p className="text-neutral-600 text-sm">Bolt these onto a package when you want the list without the legwork.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {addOns.map((a, i) => (
            <motion.div
              key={a.title}
              {...fade}
              transition={{ delay: i * 0.06 }}
              className="card p-6 border border-greige-light/80 bg-white/90"
            >
              <div className="w-11 h-11 rounded-xl bg-sage/10 flex items-center justify-center text-sage-dark mb-4">
                <a.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-neutral-800 mb-2">{a.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. CTA */}
      <section className="bg-white border-t border-greige-light/60 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Book a Consultation</h2>
          <p className="text-neutral-600 mb-8 text-sm md:text-base">
            Tell us which room or which deadline. If a package is not a fit, we&apos;ll say so — early and clearly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/contact#book" className="btn-primary inline-flex items-center justify-center gap-2 px-8">
              Book Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact#book" className="btn-outline inline-flex items-center justify-center gap-2 px-8">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>

      <PageBottomCta
        headline="Selling too?"
        body="Listing prep can stack with brokerage questions — Real Estate page keeps the license line clear."
        primaryLabel="Real estate + design"
        primaryTo="/real-estate"
      />
    </div>
  )
}
