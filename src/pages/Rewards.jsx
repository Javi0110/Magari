import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Gift, Star, Users, ArrowRight } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'

export default function RewardsPage() {
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')

  useEffect(() => {
    if (refCode) {
      sessionStorage.setItem('magari-referral-ref', refCode)
    }
  }, [refCode])

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <nav className="flex items-center text-sm text-neutral-500">
            <Link to="/" className="hover:text-sage transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">Magari Rewards Circle</span>
          </nav>
          <Link
            to="/rewards/dashboard"
            className="hidden sm:inline-flex items-center text-sm text-sage hover:text-sage-dark"
          >
            Go to dashboard
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-700 mb-4">
            Magari Rewards Circle
          </h1>
          <p className="text-lg text-neutral-600 mb-2">
            Join the Magari Rewards Circle
          </p>
          <p className="text-sm md:text-base text-neutral-600 mb-6">
            Earn points · Refer friends · Unlock exclusive rewards.
          </p>
          {refCode && (
            <p className="text-sage font-medium mb-4">
              You were invited — join below to get started.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              to={refCode ? `/rewards/dashboard?ref=${encodeURIComponent(refCode)}` : '/rewards/dashboard'}
              className="btn-primary"
            >
              Join / View my rewards
            </Link>
            <Link to="/contact#book" className="btn-outline">
              Book services
            </Link>
            <InstagramDmCta className="btn-outline" />
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-sage" />
            </div>
            <h2 className="font-serif text-xl text-neutral-800 mb-2">Earn</h2>
            <p className="text-sm text-neutral-600 mb-3">
              1 point per $1 spent, plus bonus points for creating an account, leaving reviews,
              sharing on social, and referring friends.
            </p>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>· 50 pts — create an account</li>
              <li>· 20 pts — leave a product review</li>
              <li>· 25 pts — share a purchase</li>
              <li>· 100 pts — successful referral</li>
            </ul>
          </div>

          <div className="card text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-earth/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-earth-dark" />
            </div>
            <h2 className="font-serif text-xl text-neutral-800 mb-2">Redeem</h2>
            <p className="text-sm text-neutral-600 mb-3">
              Turn points into real savings at checkout. Reward codes are created for you and can be
              applied with one click.
            </p>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>· 100 pts → $5 coupon</li>
              <li>· 200 pts → $10 coupon</li>
              <li>· 400 pts → $25 coupon</li>
            </ul>
          </div>

          <div className="card text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-taupe/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-taupe-dark" />
            </div>
            <h2 className="font-serif text-xl text-neutral-800 mb-2">Refer</h2>
            <p className="text-sm text-neutral-600 mb-3">
              Share your personal link with a friend. When they place their first order, you both
              get rewarded.
            </p>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>· Friend: $10 off their first order</li>
              <li>· You: 100 bonus points</li>
            </ul>
          </div>
        </section>

        <section className="card max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl text-neutral-800 mb-4 text-center">
            Tiers that grow with you
          </h2>
          <div className="space-y-4 text-sm text-neutral-700">
            <div>
              <p className="font-semibold text-sage-dark mb-1">Dreamer · 0–199 pts</p>
              <p>Earn points on every purchase and start building your balance.</p>
            </div>
            <div>
              <p className="font-semibold text-earth-dark mb-1">Creator · 200–499 pts</p>
              <p>Enjoy early access to drops and occasional bonus-point days.</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-800 mb-1">Magari Insider · 500+ pts</p>
              <p>Exclusive discounts, special surprises, and free-shipping perks on select orders.</p>
            </div>
          </div>
        </section>
      </div>

      <PageBottomCta
        headline="Questions about points or perks?"
        body="Reach out through the contact form or Instagram and we will help you sort it out."
      />
    </div>
  )
}

