import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BedDouble, Bath, Ruler, Loader2 } from 'lucide-react'
import { fetchActiveRealtorListings, normalizeGalleryUrls } from '../../utils/realtorListings'

export default function ActiveListingsSection() {
  const [listings, setListings] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setFetchError(null)
      const { data, error } = await fetchActiveRealtorListings()
      if (cancelled) return
      if (error) {
        setListings([])
        setFetchError(error)
        setLoadState('error')
        return
      }
      setListings(Array.isArray(data) ? data : [])
      setLoadState('ok')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      id="active-listings"
      className="bg-cream border-b border-greige-light/50 py-14 md:py-20 scroll-mt-28"
      aria-labelledby="active-listings-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-3">On the market</p>
          <h2 id="active-listings-heading" className="font-serif text-3xl md:text-4xl text-neutral-700 mb-3">
            Active listings
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Current homes represented by Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty. Details open on the listing site
            (MLS / brokerage rules apply).
          </p>
        </div>

        {loadState === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-sage" aria-hidden />
            <p className="text-sm">Loading listings…</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="max-w-xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-950">
            <p className="font-medium mb-1">We couldn&apos;t load listings right now.</p>
            <p className="text-amber-900/90 text-xs leading-relaxed">
              {fetchError?.message ? (
                <span className="font-mono text-[11px] break-all">{fetchError.message}</span>
              ) : (
                'Check that Supabase env vars are set and that the database migrations for realtor listings have been run.'
              )}
            </p>
          </div>
        )}

        {loadState === 'ok' && listings.length === 0 && (
          <div className="max-w-lg mx-auto text-center rounded-2xl border border-greige-light bg-white/90 px-6 py-10">
            <p className="font-serif text-lg text-neutral-800 mb-2">No active listings at the moment</p>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              There aren&apos;t any properties marked as active for public display. When new homes hit the market,
              they&apos;ll show up here — or reach out and we&apos;ll match you with what fits.
            </p>
            <Link to="/contact#book?intent=buyer" className="btn-primary inline-flex">
              Talk to Elena about what you&apos;re looking for
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {loadState === 'ok' && listings.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {listings.map((L, i) => (
              <ListingCard key={L.id} listing={L} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ListingCard({ listing, index }) {
  const extra = normalizeGalleryUrls(listing.gallery_urls).slice(0, 3)
  const hasLink = Boolean(listing.listing_url && listing.listing_url.startsWith('http'))
  const sqftLabel =
    listing.sqft != null && listing.sqft !== ''
      ? Number(listing.sqft).toLocaleString(undefined, { maximumFractionDigits: 0 })
      : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="card overflow-hidden border border-greige-light/80 bg-white flex flex-col h-full"
    >
      <div className="aspect-[4/3] bg-neutral-100 relative">
        {listing.cover_image_url ? (
          <img
            src={listing.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">No photo</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {listing.price_display && (
          <p className="font-serif text-xl text-sage-dark mb-1">{listing.price_display}</p>
        )}
        <h3 className="font-serif text-lg text-neutral-800 leading-snug mb-2">{listing.headline}</h3>
        {listing.address_display && (
          <p className="text-sm text-neutral-500 mb-3">{listing.address_display}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-neutral-600 mb-3">
          {listing.beds != null && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-sage" aria-hidden />
              {listing.beds} bed{Number(listing.beds) === 1 ? '' : 's'}
            </span>
          )}
          {listing.baths != null && (
            <span className="inline-flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-sage" aria-hidden />
              {listing.baths} bath{Number(listing.baths) === 1 ? '' : 's'}
            </span>
          )}
          {sqftLabel != null && !Number.isNaN(Number(listing.sqft)) && (
            <span className="inline-flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-sage" aria-hidden />
              {sqftLabel} sq ft
            </span>
          )}
        </div>
        {listing.summary && <p className="text-sm text-neutral-600 leading-relaxed mb-4 flex-1">{listing.summary}</p>}
        {extra.length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {extra.map((url) => (
              <div key={url} className="w-12 h-12 rounded-lg overflow-hidden border border-greige-light shrink-0">
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
        {hasLink ? (
          <a
            href={listing.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-block text-sm mt-auto"
          >
            View listing
            <ArrowRight className="w-4 h-4" />
          </a>
        ) : (
          <Link to="/contact#book?intent=buyer" className="btn-outline btn-block text-sm mt-auto">
            Ask about this home
          </Link>
        )}
      </div>
    </motion.article>
  )
}
