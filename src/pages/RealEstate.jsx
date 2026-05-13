import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, KeyRound, Layers, Phone, ArrowRight, Check } from 'lucide-react'

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="border-b border-greige-light/60 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Real estate</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">
            Buy smarter. Sell stronger — with design-minded guidance at the table.
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Whether you&apos;re landing your next home or preparing a listing to shine online and in person,
            Magari &amp; Co. pairs real estate strategy with staging and interiors so nothing gets lost in translation.
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
              Sell With Magari
              <ArrowRight className="w-4 h-4" />
            </Link>
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
            <p className="text-neutral-600 leading-relaxed mb-6">
              See beyond paint samples: we help you evaluate flow, light, and renovation potential so your offer
              matches how you actually want to live — not just how the listing photographs today.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Neighborhood fit & lifestyle alignment',
                'Offer strategy with design-aware walkthroughs',
                'Intro to trusted partners when you need quotes fast',
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
            <p className="text-neutral-600 leading-relaxed mb-6">
              Listings win when they feel intentional online and effortless in person. We align prep, staging
              priorities, and story-driven presentation so buyers linger — and remember.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Pre-list prep roadmap (what to tackle first)',
                'Staging guidance tuned to your timeline',
                'Collaboration with your listing plan — not against it',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/contact#book?intent=seller" className="btn-secondary w-full sm:w-auto inline-block text-center px-8 py-3">
              Sell With Magari
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
                Most buyers meet their home twice: once during a rushed showing, and again after move-in when the
                quirks appear. The <strong className="font-medium text-neutral-700">Buy + Design Advantage</strong>{' '}
                is our signature pairing: real estate insight <em>and</em> interior design fluency in the same
                conversation — so you&apos;re not translating between a realtor and a designer while the clock ticks.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-8">
                For sellers, the same fluency means prep that actually photographs, flows for open houses, and reads
                as cohesive — not last-minute scatter fixes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/contact#book?intent=buy-design" className="btn-primary inline-flex items-center justify-center gap-2">
                  Book a Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/services" className="btn-outline inline-flex items-center justify-center">
                  View design packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-neutral-500 leading-relaxed">
          Real estate services are provided by Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty. Magari &amp; Co.
          design and staging offerings are coordinated separately — we&apos;ll always be clear about what&apos;s what.
        </p>
        <Link to="/portfolio" className="inline-block mt-6 text-sage-dark font-medium hover:underline">
          See before &amp; after transformations →
        </Link>
      </section>
    </div>
  )
}
