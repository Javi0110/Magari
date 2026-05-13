import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, KeyRound, Layers, ArrowRight, Check } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import RealEstateLeadForm from '../components/RealEstateLeadForm'
import PageBottomCta from '../components/PageBottomCta'

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-greige-light/60 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Real estate</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">
            Real Estate + Design Advantage
          </h1>
          <p className="text-base font-semibold text-neutral-800 mb-4">
            Realtor<sup>®</sup> @ eXp Realty
          </p>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4">
            Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty — real estate services provided through eXp Realty. Magari
            &amp; Co. is <strong className="font-medium text-neutral-700">not</strong> a brokerage; it is the design and
            staging studio. We never blur that line in contracts or marketing.
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Licensed questions stay in the brokerage lane; prep, staging, and interiors stay with Magari. Same thread,
            two clear roles — less telephone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              to="/contact#book?intent=buyer"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Schedule Buyer Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact#book?intent=seller"
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              Sell With Magari
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
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">For Buyers</h2>
            <p className="text-neutral-600 leading-relaxed mb-3">
              Tours with layout context, not just pretty staging — so you know what you are buying.
            </p>
            <p className="text-neutral-600 text-sm mb-6">Licensed representation through eXp Realty.</p>
            <ul className="space-y-3 mb-8">
              {[
                'Neighborhood tours aligned with how you actually live',
                'Offer strategy with design-aware walkthroughs',
                'Negotiation support with clear timelines',
                'Guidance through inspection + next-step trades',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/contact#book?intent=buyer"
              className="btn-primary w-full sm:w-auto inline-block text-center px-8 py-3"
            >
              Schedule Buyer Consultation
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
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">For Sellers</h2>
            <p className="text-neutral-600 leading-relaxed mb-3">
              Online polish + in-person flow so buyers slow down and remember the address.
            </p>
            <p className="text-neutral-600 text-sm mb-6">
              Listing strategy through eXp Realty; prep and staging through Magari &amp; Co. Ask about the{' '}
              <Link to="/services#packages" className="text-sage-dark font-medium hover:underline">
                Listing Prep Package
              </Link>{' '}
              when you want a written runway before photos.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Prep roadmap: what to tackle first for ROI',
                'Staging notes matched to your go-live date',
                'Photo-day priorities so MLS hits strong on day one',
                'Agent + designer cadence — not competing checklists',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/contact#book?intent=seller"
              className="btn-secondary w-full sm:w-auto inline-block text-center px-8 py-3"
            >
              Sell With Magari
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="buy-design" className="bg-white border-y border-greige-light/50 py-16 md:py-20 scroll-mt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="w-14 h-14 rounded-2xl bg-sage/10 flex items-center justify-center text-sage-dark shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Buy + Design</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Most buyers tour fast, then notice the quirks after closing. When your Realtor<sup>®</sup> @ eXp Realty
                and Magari interiors share a thread, you get fewer &ldquo;ask the other person&rdquo; loops — and faster
                clarity on what a room could become.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Sellers get the same advantage: prep that photographs, open-house flow that reads intentional — not
                last-minute scatter fixes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Link to="/contact#book?intent=buyer" className="btn-primary inline-flex items-center justify-center gap-2">
                  Schedule Buyer Consultation
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <RealEstateLeadForm id="real-estate-inquiry" />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8 text-center">
        <p className="text-sm text-neutral-500 leading-relaxed mb-3">
          Real estate services provided by Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty (eXp Realty). Magari &amp;
          Co. is not a brokerage.
        </p>
        <Link to="/portfolio" className="inline-block mt-4 text-sage-dark font-medium hover:underline">
          See before &amp; after transformations →
        </Link>
      </section>

      <PageBottomCta
        headline="Buying, selling, or both?"
        body="Use the form above for a quick email intro — or the full booking flow on Contact. Instagram works for short questions."
        primaryLabel="Book on Contact"
        primaryTo="/contact#book"
      />
    </div>
  )
}
