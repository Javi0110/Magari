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
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-4 text-balance">
            Real Estate, the Magari way.
          </h1>
          <p className="text-lg md:text-xl text-neutral-700 font-medium mb-4">
            Buy • Sell • Invest — with design strategy built in.
          </p>
          <p className="text-sm font-semibold text-sage-dark mb-6">
            Elena Fadhel | Realtor<sup>®</sup> @ eXp Realty | Georgetown + Austin, TX
          </p>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4">
            Real estate is more than contracts — it&apos;s lifestyle, design, potential, and long-term value. I help clients
            buy and sell with confidence by combining real estate expertise with an interior designer&apos;s eye.
          </p>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Magari &amp; Co. is the design and staging studio — not a brokerage. Licensed real estate services are offered
            separately through eXp Realty by Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              to="/contact#book?intent=buyer"
              className="btn-primary"
            >
              Schedule a Buyer Call
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact#book?intent=seller"
              className="btn-secondary"
            >
              Sell With Magari
              <ArrowRight className="w-4 h-4" />
            </Link>
            <InstagramDmCta className="btn-outline w-full sm:w-auto" />
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
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">Buying a Home</h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Whether it&apos;s your first home or your next investment, I guide you through the process with clarity and
              strategy.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Personalized home search + MLS access',
                'Private showings & offer guidance',
                'Negotiation strategy',
                'Inspection support + next steps',
                'Closing coordination and support',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/contact#book?intent=buyer" className="btn-primary w-full sm:w-auto px-8 py-3">
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
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">Selling a Home</h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Selling is about positioning. I help you prepare your home so it photographs beautifully, shows better, and
              attracts stronger offers.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Pricing + market strategy',
                'Listing preparation plan',
                'Staging guidance & optional styling packages',
                'Professional presentation support',
                'Negotiation + contract management',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                  <Check className="w-5 h-5 text-sage shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/contact#book?intent=seller" className="btn-secondary w-full sm:w-auto px-8 py-3">
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
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Buy + Design Advantage</h2>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Most buyers can&apos;t see past ugly paint, outdated lighting, or empty rooms. I can. I help you recognize the
                potential in a property — and I help you turn it into a dream home.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'See renovation potential instantly',
                  'Avoid costly layout mistakes',
                  'Visualize updates before you buy',
                  'Design strategy that protects your investment',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-neutral-600 text-sm">
                    <Check className="w-5 h-5 text-sage shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Link to="/contact#book?intent=buyer" className="btn-primary">
                  Schedule a Buyer Call
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/services" className="btn-outline">
                  View services
                </Link>
                <InstagramDmCta className="btn-outline" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-4">Let&apos;s make your next move your best move.</h2>
        <p className="text-neutral-600 mb-8 text-sm md:text-base">
          Book a consultation and tell me what you&apos;re looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          <Link to="/contact#book?intent=buyer" className="btn-primary px-8">
            Schedule Buyer Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/contact#book?intent=seller" className="btn-secondary px-8">
            Request Seller Strategy Call
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <RealEstateLeadForm
          id="real-estate-inquiry"
          formTitle="Let's connect"
          formIntro="Fill out the form and I'll reach out within 24–48 hours."
          submitLabel="Send Message"
        />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-10 text-center">
        <p className="text-sm text-neutral-500 leading-relaxed">
          Real estate services provided by Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty.
        </p>
        <Link to="/portfolio" className="inline-block mt-6 text-sage-dark font-medium hover:underline">
          View Portfolio →
        </Link>
      </section>

      <PageBottomCta
        headline="Questions before you book?"
        body="Use Contact for the full form, or DM on Instagram for quick asks."
        primaryLabel="Book a Consultation"
        primaryTo="/contact#book"
      />
    </div>
  )
}
