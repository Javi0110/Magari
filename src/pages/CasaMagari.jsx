import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Home, Palette, Users, Hammer, Mail } from 'lucide-react'
import { supabase } from '../utils/supabase'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import BookConsultButton from '../components/BookConsultButton'

export default function CasaMagariPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = (email || '').trim()
    if (!trimmed) return
    try {
      setStatus('saving')
      if (supabase) {
        await supabase.from('shop_newsletter_signups').insert({
          email: trimmed,
          source: 'casa-magari'
        })
      }
      setStatus('success')
      setEmail('')
    } catch (err) {
      console.error('Error saving Casa Magari signup:', err)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-cream-dark/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-sm text-neutral-500">
            <Link to="/" className="hover:text-sage transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">Casa Magari</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* Hero / concept */}
        <section className="grid md:grid-cols-[1.4fr,1fr] gap-10 md:gap-14 items-center">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-neutral-800 mb-4">
              Casa Magari — the stay we&apos;re sketching in slow motion.
            </h1>
            <p className="text-lg text-neutral-600 mb-3">
              One physical house: studio work, Magari shop shelves, and MOMade makers in rotation — not three
              disconnected brands.
            </p>
            <p className="text-neutral-600 text-sm md:text-base">
              Goal: sleep there like an Airbnb guest, touch the textiles, scan a tag, buy the mug on the way out.
              Still fundraising + floor-planning — this page is the honest preview.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap mt-8">
              <BookConsultButton variant="modal" className="btn-primary">
                Book a consult
              </BookConsultButton>
              <BookConsultButton variant="page" className="btn-outline">
                Scheduling page (/book)
              </BookConsultButton>
              <Link to="/shop" className="btn-outline">
                Shop Magari
              </Link>
              <InstagramDmCta className="btn-outline" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-sage/10 to-taupe/10 p-6 md:p-7"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sage mb-3">
              The concept
            </p>
            <p className="text-neutral-700 mb-3 text-sm">
              Not built yet — you&apos;re seeing sketches, budgets, and mood boards in public on purpose.
            </p>
            <p className="text-neutral-700 text-sm">
              Email list = first heads-up on stays, open studios, and maker weekends. No spam folder novels.
            </p>
          </motion.div>
        </section>

        {/* Design philosophy */}
        <section className="grid md:grid-cols-2 gap-10 items-start">
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-sage" />
              <h2 className="font-serif text-2xl text-neutral-800">
                The design philosophy
              </h2>
            </div>
            <p className="text-neutral-600 text-sm md:text-base mb-3">
              Casa Magari is built on the same values as Magari &amp; Co.: layered, lived-in spaces that feel
              collected over time, not rushed in a weekend.
            </p>
            <ul className="text-sm text-neutral-700 space-y-2">
              <li>• Warm neutrals, texture-rich materials, and art that feels personal.</li>
              <li>• Pieces that invite you to slow down—morning coffee mugs, soft textiles, quiet corners.</li>
              <li>• Styling that feels editorial but still livable for real families and real messes.</li>
            </ul>
          </div>

          {/* Supporting local artists */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-sage" />
              <h2 className="font-serif text-2xl text-neutral-800">
                Supporting local artists &amp; mom makers
              </h2>
            </div>
            <p className="text-neutral-600 text-sm md:text-base mb-3">
              Every room in Casa Magari will be a living gallery for mom-made and local work. Ceramics from
              MOMade makers, textiles from local artists, original art and prints, styled like a home—not a showroom.
            </p>
            <p className="text-neutral-600 text-sm md:text-base">
              Guests will be able to scan a code in each room to learn about the maker behind the piece and shop
              directly—turning every stay into support for a real person&apos;s creative work.
            </p>
          </div>
        </section>

        {/* Behind the scenes */}
        <section className="card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-sage" />
            <h2 className="font-serif text-2xl text-neutral-800">
              Behind the scenes: building Casa Magari
            </h2>
          </div>
          <p className="text-neutral-600 text-sm md:text-base mb-4">
            Right now, Casa Magari lives in sketches, Pinterest boards, floor plan drafts, and notes on my phone.
            We&apos;re exploring locations, planning layouts, and dreaming up experiences that feel like a retreat
            for both design lovers and tired moms who need a soft place to land.
          </p>
          <p className="text-neutral-600 text-sm md:text-base mb-4">
            As we move through each phase—finding the right house, designing each room, selecting makers—you&apos;ll
            get to follow along from the very beginning.
          </p>
          <p className="text-neutral-600 text-sm md:text-base">
            Think of this as the “behind the scenes” of a future Airbnb: the messy middle, the creative decisions,
            and the tiny details that make a place feel like home.
          </p>
        </section>

        {/* Join the journey – email signup */}
        <section className="card p-8 md:p-10 text-center bg-gradient-to-br from-sage/10 to-taupe/10">
          <div className="flex flex-col items-center gap-3 mb-4">
            <Sparkles className="w-7 h-7 text-sage" />
            <h2 className="font-serif text-3xl text-neutral-800">
              Join the Casa Magari journey
            </h2>
          </div>
          <p className="text-neutral-700 mb-6 max-w-xl mx-auto text-sm md:text-base">
            If you&apos;d love to stay at Casa Magari when it launches—or just want to see how a dream like this
            comes to life—add your email below. This list will get:
          </p>
          <ul className="text-sm text-neutral-700 mb-6 max-w-md mx-auto text-left space-y-2">
            <li>• First access to Airbnb booking dates when we open.</li>
            <li>• Behind-the-scenes updates as we design the space.</li>
            <li>• Spotlights on the artists and mom makers featured in the house.</li>
          </ul>
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={status === 'saving'}
              className="btn-primary px-6 py-3 text-sm disabled:opacity-60"
            >
              {status === 'saving' ? 'Joining…' : 'Join the list'}
            </button>
          </form>
          {status === 'success' && (
            <p className="mt-3 text-xs text-sage">
              You&apos;re in. We&apos;ll keep you posted as Casa Magari takes shape.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-xs text-red-500">
              Something went wrong. Please try again in a moment.
            </p>
          )}
        </section>
      </div>

      <PageBottomCta
        headline="Want updates only when it&apos;s real?"
        body="Join the email list above, book a consult for your own place today, or DM with the word Casa and we&apos;ll add you manually if forms hate you."
      />
    </div>
  )
}

