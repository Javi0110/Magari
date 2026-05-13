import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import { PORTFOLIO_ITEMS, PORTFOLIO_FILTERS } from '../data/portfolioGallery'

export default function PortfolioPage() {
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)

  const filtered =
    filter === 'all' ? PORTFOLIO_ITEMS : PORTFOLIO_ITEMS.filter((item) => item.category === filter)

  const openLightbox = (item) => setLightbox(item)
  const closeLightbox = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [lightbox, closeLightbox])

  return (
    <div className="min-h-screen bg-cream">
      <section className="bg-white border-b border-greige-light/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Portfolio</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">Before &amp; After</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Filter by project type — tap an image for a larger view. Swap in real photography when ready; structure stays
            the same.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/contact#book" className="btn-primary inline-flex items-center justify-center gap-2">
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="/#lead-magnet" className="btn-outline inline-flex items-center justify-center">
              Free Home Prep Checklist
            </a>
            <InstagramDmCta className="btn-outline inline-flex items-center justify-center" />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {PORTFOLIO_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                filter === f.id
                  ? 'bg-sage text-white border-sage shadow-sm'
                  : 'bg-white text-neutral-600 border-greige-light hover:border-sage-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 9) * 0.03 }}
              onClick={() => openLightbox(item)}
              className="group text-left rounded-2xl overflow-hidden border border-greige-light bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className="p-3 md:p-4 bg-white/95 border-t border-greige-light/60">
                <p className="font-serif text-sm md:text-base text-neutral-800 leading-snug">{item.title}</p>
                <p className="text-[11px] uppercase tracking-wider text-sage-dark mt-1">
                  {PORTFOLIO_FILTERS.find((x) => x.id === item.category)?.label || item.category}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Project image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-greige-light"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-3 right-3 z-10 rounded-full bg-white/95 p-2 text-neutral-700 hover:bg-cream border border-greige-light shadow-sm"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="max-h-[75vh] overflow-auto">
                <img src={lightbox.src} alt={lightbox.title} className="w-full h-auto object-contain bg-neutral-100" />
              </div>
              <div className="p-5 border-t border-greige-light">
                <p className="font-serif text-xl text-neutral-800">{lightbox.title}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {PORTFOLIO_FILTERS.find((x) => x.id === lightbox.category)?.label}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="max-w-3xl mx-auto px-4 pb-10 text-center">
        <p className="text-neutral-600 mb-6 text-sm">
          Want your project in a future case study? Say so when you book — we only publish with your OK.
        </p>
        <Link to="/services" className="text-sage-dark font-medium hover:underline">
          Explore services &amp; packages →
        </Link>
      </section>

      <PageBottomCta
        headline="Like this direction?"
        body="Send photos + your timeline. We&apos;ll tell you honest next steps — consult, package, or wait until paint dries."
      />
    </div>
  )
}
