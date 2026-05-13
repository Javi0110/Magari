import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'

const projects = [
  { title: 'Living room refresh', location: 'Austin, TX', type: 'Staging + styling' },
  { title: 'Primary suite layering', location: 'Austin, TX', type: 'Interior design' },
  { title: 'Listing launch prep', location: 'Central TX', type: 'Listing prep' },
  { title: 'Kitchen sightlines', location: 'Austin, TX', type: 'Virtual design' },
]

function BeforeAfterCard({ title, location, type, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-greige-light to-greige flex flex-col items-center justify-center p-4 text-center border border-greige-light">
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone mb-2">Before</span>
          <span className="font-serif text-sm text-neutral-600 leading-snug">{title}</span>
        </div>
        <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-sage-muted/60 to-sage/25 flex flex-col items-center justify-center p-4 text-center border border-sage-muted">
          <span className="text-[10px] uppercase tracking-[0.2em] text-sage-dark mb-2">After</span>
          <span className="font-serif text-sm text-sage-dark leading-snug">Curated layers &amp; flow</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        {type} · {location}
      </p>
      <p className="text-[11px] text-neutral-400 mt-1">
        Replace placeholders with project photography when available.
      </p>
    </motion.div>
  )
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="bg-white border-b border-greige-light/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Portfolio</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">
            Before &amp; After
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
            A quiet preview of the kind of transformation we chase: calmer sightlines, warmer layers, and spaces
            that feel finished — not fussy.
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {projects.map((p, i) => (
            <BeforeAfterCard key={p.title} {...p} index={i} />
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-10 text-center">
        <p className="text-neutral-600 mb-6">
          Want your home featured in our next case study? Mention it when you book — we love documenting thoughtful
          reveals (with your approval, always).
        </p>
        <Link to="/services" className="text-sage-dark font-medium hover:underline">
          Explore services &amp; packages →
        </Link>
      </section>

      <PageBottomCta
        headline="Love what you see?"
        body="Book a consultation to talk scope and timeline, or DM us on Instagram with photos of your space."
      />
    </div>
  )
}
