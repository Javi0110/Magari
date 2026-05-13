import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Store, ArrowRight, Users } from 'lucide-react'
import { supabase } from '../utils/supabase'
import PageBottomCta from '../components/PageBottomCta'

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export default function MomadeCommunityPage() {
  const [makers, setMakers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      setLoading(true)
      let { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, name, profile_bio, profile_location, profile_instagram, profile_avatar_url, slug')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8)
      if (error && error.code === '42703') {
        const fb = await supabase
          .from('vendors')
          .select('id, business_name, name')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8)
        data = fb.data
        error = fb.error
      }
      if (data && !error) {
        setMakers(
          data.map((v) => ({
            id: v.id,
            slug: v.slug || String(v.id),
            businessName: v.business_name,
            name: v.name,
            bio: (v.profile_bio || '').slice(0, 120),
            location: v.profile_location || '',
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      <section className="bg-white border-b border-greige-light/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-sage-dark mb-4">Community</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 mb-6 text-balance">
            MOMade Marketplace
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-4">
            A curated shelf for mom-owned brands — ceramics, textiles, paper goods, gifts. We pick for craft and
            story, not algorithm churn.
          </p>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto mb-10">
            Shopping lives on the marketplace tab. This page is the “why” — who we spotlight and how to join.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/momade/shop" className="btn-primary inline-flex items-center justify-center gap-2">
              Shop the marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/become-a-vendor" className="btn-outline inline-flex items-center justify-center gap-2">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <motion.div {...fade}>
            <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center text-sage-dark mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl text-neutral-700 mb-4">What is MOMade?</h2>
            <ul className="space-y-3 text-neutral-600 text-sm md:text-base">
              <li className="flex gap-2">
                <span className="text-sage-dark font-bold">·</span>
                Mom-made products vetted by Magari &amp; Co. — same eye we use on installs.
              </li>
              <li className="flex gap-2">
                <span className="text-sage-dark font-bold">·</span>
                Makers keep their voice; we handle the storefront layer and discovery.
              </li>
              <li className="flex gap-2">
                <span className="text-sage-dark font-bold">·</span>
                Your design or listing project still leads — MOMade is a joyful add-on, not a detour.
              </li>
            </ul>
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.06 }} className="card p-8 border border-greige-light/80 bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-taupe/15 flex items-center justify-center text-taupe-dark mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-neutral-700 mb-3">For shoppers</h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-4">
              Filters by maker and category, cart checkout you already trust on Magari. Want something styled like
              your install? Book a consult — we&apos;ll point to pieces that actually fit the room.
            </p>
            <Link to="/services" className="text-sage-dark font-medium text-sm hover:underline">
              Book design / staging →
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-white border-y border-greige-light/50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-2">Featured makers</h2>
              <p className="text-neutral-600 text-sm max-w-xl">
                Rotating spotlight — tap through to vendor profiles when live data is connected.
              </p>
            </div>
            <Link to="/momade/shop" className="btn-outline inline-flex items-center gap-2 shrink-0">
              <Store className="w-4 h-4" />
              Browse all products
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-neutral-500 py-12">Loading makers…</p>
          ) : makers.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 border border-dashed border-greige-light text-center text-neutral-500 text-sm">
                  Maker slot {i} — connect vendors in Supabase to populate.
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {makers.slice(0, 8).map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-6 border border-greige-light/80 hover:border-sage-muted/60 transition-colors"
                >
                  <p className="font-serif text-lg text-neutral-800 mb-1">{m.businessName}</p>
                  <p className="text-xs text-neutral-500 mb-2">by {m.name}</p>
                  {m.bio && <p className="text-sm text-neutral-600 line-clamp-3 mb-4">{m.bio}</p>}
                  <Link
                    to={`/maker/${encodeURIComponent(m.slug)}`}
                    className="text-sage-dark text-sm font-medium hover:underline"
                  >
                    View profile →
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl text-neutral-700 mb-4">Make with us</h2>
        <p className="text-neutral-600 mb-6 text-sm">
          Applications are read by humans — expect a clear yes / not-yet with feedback.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/become-a-vendor" className="btn-primary inline-flex items-center justify-center gap-2">
            Become a Vendor
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/momade/shop" className="btn-outline inline-flex items-center justify-center">
            Shop the Marketplace
          </Link>
        </div>
      </section>

      <PageBottomCta
        headline="Need design help too?"
        body="MOMade is the marketplace arm — interiors and staging stay on Services. One team, two tabs."
      />
    </div>
  )
}
