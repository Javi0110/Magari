import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, KeyRound, Layers, Phone, ArrowRight, Check } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import MiniBookingForm from '../components/MiniBookingForm'
import PageBottomCta from '../components/PageBottomCta'

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-greige-light/60 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Real estate</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">
            Buy or sell with someone who reads floor plans like a designer.
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4">
            <span className="font-medium text-neutral-700">Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty.</span>{' '}
            Real estate services provided through eXp Realty.
          </p>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-5">
            Magari &amp; Co. is design and staging only — not a brokerage. We keep the two lanes labeled so you always
            know who is doing what.
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Elena handles licensed questions; the Magari studio handles prep, staging, and interiors. Same table, two
            clear roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              to="/contact#book?intent=buyer"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Schedule a Buyer Call
              <Phone className="w-4 h-4" />
            </Link>
            <Link
              to="/contact#book?intent=seller"
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              Discuss selling (eXp Realty)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <InstagramDmCta className="btn-outline inline-flex items-center justify-center w-full sm:w-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 md:p-10 border border-greige-light/80"
            id="buy"
          >
            <div className="w-12 h-12 rounded-2xl bg-sage-muted/40 flex items-center justify-center text-sage-dark mb-6">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">Buying</h2>
            <p className="text-neutral-600 leading-relaxed mb-3">
              Look past paint chips: flow, light, and renovation math before you write the offer.
            </p>
            <p className="text-neutral-600 text-sm mb-6">Licensed guidance through eXp Realty.</p>
            <ul className="space-y-3 mb-8">
              {[
                'Neighborhood fit + how you actually live day-to-day',
                'Offer strategy with design-aware walkthroughs',
                'Fast intros to vetted trades when you need bids',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/contact#book?intent=buyer" className="btn-primary w-full sm:w-auto inline-block text-center px-8 py-3">
              Schedule a Buyer Call
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="card p-8 md:p-10 border border-greige-light/80"
            id="sell"
          >
            <div className="w-12 h-12 rounded-2xl bg-earth/15 flex items-center justify-center text-earth-dark mb-6">
              <Home className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">Selling</h2>
            <p className="text-neutral-600 leading-relaxed mb-3">
              Online polish + in-person flow so buyers slow down and remember the house.
            </p>
            <p className="text-neutral-600 text-sm mb-6">
              Listing strategy through eXp Realty; prep and staging through Magari &amp; Co.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Prep roadmap: what to tackle first',
                'Staging notes matched to your calendar',
                'Listing plan + design team in sync — not competing',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/contact#book?intent=seller" className="btn-secondary w-full sm:w-auto inline-block text-center px-8 py-3">
              Discuss selling (eXp Realty)
            </Link>
          </motion.div>
        </div>
      </section>

      <section
        id="buy-design"
        className="bg-white border-y border-greige-light/50 py-16 md:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-14 h-14 rounded-2xl bg-sage/10 flex items-center justify-center text-sage-dark shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Buy + Design Advantage</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Most buyers tour fast, then notice the quirks after closing.{' '}
                <strong className="font-medium text-neutral-700">Buy + Design Advantage</strong> keeps your{' '}
                Realtor<sup>®</sup> @ eXp Realty and Magari &amp; Co. interiors in one thread — fewer “ask the other
                person” delays.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Sellers get the same thing: prep that photographs, open-house flow that reads cohesive — not
                last-minute scatter fixes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Link to="/contact#book?intent=buy-design" className="btn-primary inline-flex items-center justify-center gap-2">
                  Book a Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/services" className="btn-outline inline-flex items-center justify-center">
                  View design packages
                </Link>
                <InstagramDmCta className="btn-outline inline-flex items-center justify-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <MiniBookingForm pageLabel="Real Estate" id="quick-book-real-estate" />
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-neutral-500 leading-relaxed mb-3">
          Real estate services provided through eXp Realty. Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty.
        </p>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Magari &amp; Co. offers design and staging only and is not a brokerage. We&apos;ll label which hat we&apos;re
          wearing on every call.
        </p>
        <Link to="/portfolio" className="inline-block mt-6 text-sage-dark font-medium hover:underline">
          See before &amp; after transformations →
        </Link>
      </section>

      <PageBottomCta
        headline="Buying, selling, or both?"
        body="Use the contact form for a buyer or seller call (brokerage through eXp Realty — Elena Fadhel, Realtor® @ eXp Realty). Quick questions? DM on Instagram."
        primaryLabel="Book a real estate consult"
        primaryTo="/contact#book"
      />
    </div>
  )
}
