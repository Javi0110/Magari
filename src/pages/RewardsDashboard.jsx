import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, ArrowRight, Star, LogOut } from 'lucide-react'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'

const TIERS = [
  { id: 'dreamer', label: 'Dreamer', min: 0, max: 199 },
  { id: 'creator', label: 'Creator', min: 200, max: 499 },
  { id: 'insider', label: 'Magari Insider', min: 500, max: Infinity },
]

function getTier(points) {
  return TIERS.find((t) => points >= t.min && points <= t.max) || TIERS[0]
}

export default function RewardsDashboardPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [ledger, setLedger] = useState([])
  const [orders, setOrders] = useState([])
  const [coupons, setCoupons] = useState([])
  const [error, setError] = useState(null)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('magari-rewards-email')
    if (stored) setEmail(stored)
  }, [])

  const handleLoad = async (e) => {
    if (e) e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    localStorage.setItem('magari-rewards-email', trimmed)

    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/.netlify/functions/rewards-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const text = await res.text()
      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(
          'Rewards server returned an invalid response. On local dev, run `netlify dev` (Vite alone does not serve /.netlify/functions).'
        )
      }
      if (!res.ok) {
        const msg = data.hint ? `${data.error}. ${data.hint}` : (data.error || 'Could not load rewards right now.')
        throw new Error(msg)
      }
      setUser(data.user)
      setLedger(data.ledger || [])
      setOrders(data.orders || [])
      setCoupons(data.coupons || [])
    } catch (err) {
      console.error('Error loading rewards:', err)
      setError(err.message || 'Could not load rewards right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('magari-rewards-email')
    setEmail('')
    setUser(null)
    setLedger([])
    setOrders([])
    setCoupons([])
    setError(null)
  }

  const handleRedeem = async (reward) => {
    if (!email || !user) return
    setRedeeming(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/.netlify/functions/rewards-redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), reward }),
      })
      const text = await res.text()
      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error('Could not read redeem response. Try again or use production with Netlify functions enabled.')
      }
      if (!res.ok) {
        throw new Error(data.error || 'Could not redeem reward.')
      }
      // Refresh profile so points, ledger, and coupons update
      await handleLoad()
      alert(`Created reward coupon: ${data.coupon.code}`)
    } catch (err) {
      console.error('Redeem error:', err)
      setError(err.message || 'Could not redeem reward right now.')
    } finally {
      setRedeeming(false)
    }
  }

  const points = user?.points || 0
  const tier = getTier(points)
  const nextTier = TIERS.find((t) => t.min > tier.min)
  const pointsToNext =
    nextTier && Number.isFinite(nextTier.min) ? Math.max(0, nextTier.min - points) : 0

  const progressPercent = (() => {
    if (!nextTier) return 100
    const span = nextTier.min - tier.min || 1
    return Math.max(0, Math.min(100, ((points - tier.min) / span) * 100))
  })()

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <nav className="flex items-center text-sm text-neutral-500">
            <Link to="/" className="hover:text-sage transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/rewards" className="hover:text-sage transition-colors">
              Magari Rewards Circle
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">Dashboard</span>
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-sage transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            )}
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center text-sm text-sage hover:text-sage-dark"
            >
              Shop now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <section className="card">
          <h1 className="font-serif text-2xl md:text-3xl text-neutral-800 mb-1">
            Magari Rewards Circle
          </h1>
          <p className="text-sm text-neutral-600 mb-4">
            Join the Magari Rewards Circle — earn points, refer friends, and unlock exclusive rewards.
          </p>
          <form onSubmit={handleLoad} className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="form-label">Email used for your orders</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm"
                placeholder="you@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading…' : 'View my rewards'}
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/contact#book" className="btn-outline btn-sm">
              Book services
            </Link>
            <InstagramDmCta className="btn-outline btn-sm" />
          </div>
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </section>

        {user && (
          <>
            <section className="grid md:grid-cols-3 gap-6">
              <div className="card">
                <p className="text-sm text-neutral-500 mb-1">Current points</p>
                <p className="text-3xl font-semibold text-sage">{points}</p>
              </div>
              <div className="card">
                <p className="text-sm text-neutral-500 mb-1">Tier</p>
                <p className="text-xl font-semibold text-neutral-800 mb-2">{tier.label}</p>
                {nextTier ? (
                  <p className="text-xs text-neutral-600">
                    {pointsToNext} pts until {nextTier.label}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-600">You&apos;re at the very top ✨</p>
                )}
                <div className="mt-3 h-2 w-full rounded-full bg-cream-dark/40 overflow-hidden">
                  <div
                    className="h-full bg-sage rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="card">
                <p className="text-sm text-neutral-500 mb-1">Referral link</p>
                <p className="text-xs text-neutral-700 break-all mb-2">
                  <a
                    href={`${typeof window !== 'undefined' ? window.location.origin : ''}/rewards?ref=${user.referral_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage hover:underline"
                  >
                    {typeof window !== 'undefined' ? `${window.location.origin}/rewards?ref=${user.referral_code}` : ''}
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/rewards?ref=${user.referral_code}`
                    navigator.clipboard?.writeText(url).then(() => alert('Link copied!'), () => {})
                  }}
                  className="text-xs text-sage hover:underline"
                >
                  Copy link
                </button>
              </div>
            </section>

            <section className="grid lg:grid-cols-[2fr,3fr] gap-6">
              <div className="card">
                <h2 className="font-serif text-xl text-neutral-800 mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-sage" />
                  How to earn
                </h2>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>· 1 pt per $1 spent on eligible orders</li>
                  <li>· 50 pts for creating a rewards account</li>
                  <li>· 20 pts for each approved product review</li>
                  <li>· 100 pts for each successful referral</li>
                </ul>
                <div className="mt-4 border-t border-cream-dark/50 pt-3">
                  <p className="text-sm font-semibold text-neutral-800 mb-2">Redeem points</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      disabled={redeeming || points < 100}
                      onClick={() => handleRedeem('100')}
                      className="px-3 py-2 rounded-full border border-sage/40 text-neutral-700 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      100 pts → $5
                    </button>
                    <button
                      type="button"
                      disabled={redeeming || points < 200}
                      onClick={() => handleRedeem('200')}
                      className="px-3 py-2 rounded-full border border-sage/40 text-neutral-700 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      200 pts → $10
                    </button>
                    <button
                      type="button"
                      disabled={redeeming || points < 400}
                      onClick={() => handleRedeem('400')}
                      className="px-3 py-2 rounded-full border border-sage/40 text-neutral-700 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      400 pts → $25
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="font-serif text-xl text-neutral-800 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-taupe" />
                  Recent activity
                </h2>
                {ledger.length === 0 ? (
                  <p className="text-sm text-neutral-600">
                    Points from purchases appear after payment is confirmed (return to the site after Stripe or via
                    webhook). Use the same email here as in checkout. Creating this rewards account adds signup points
                    first; shop purchases add a separate &quot;purchase&quot; line.
                  </p>
                ) : (
                  <ul className="text-sm text-neutral-700 space-y-2 max-h-56 overflow-y-auto">
                    {ledger.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between border-b border-cream-dark/40 pb-1 last:border-0"
                      >
                        <div>
                          <p className="capitalize">{entry.type}</p>
                          {entry.created_at && (
                            <p className="text-[11px] text-neutral-500">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            entry.points >= 0 ? 'text-sage' : 'text-earth-dark'
                          }`}
                        >
                          {entry.points > 0 ? `+${entry.points}` : entry.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-serif text-xl text-neutral-800 mb-3">Your orders</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-neutral-600">
                    Paid Shop Magari checkouts (Stripe) are listed here once the site confirms payment — same email as
                    at checkout. If something is missing, open your order confirmation email or contact us with the
                    Stripe receipt.
                  </p>
                ) : (
                  <ul className="text-sm text-neutral-700 space-y-2 max-h-60 overflow-y-auto">
                    {orders.map((order) => (
                      <li
                        key={order.id}
                        className="flex items-center justify-between border-b border-cream-dark/40 pb-1 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-neutral-800">Order #{order.id}</p>
                          {order.created_at && (
                            <p className="text-[11px] text-neutral-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-neutral-800">
                          ${Number(order.total || 0).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card">
                <h2 className="font-serif text-xl text-neutral-800 mb-3">Reward coupons</h2>
                {coupons.length === 0 ? (
                  <p className="text-sm text-neutral-600">
                    Once you redeem points, your reward coupons will appear here.
                  </p>
                ) : (
                  <ul className="text-sm text-neutral-700 space-y-2 max-h-60 overflow-y-auto">
                    {coupons.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between border-b border-cream-dark/40 pb-1 last:border-0"
                      >
                        <div>
                          <p className="font-mono text-xs">{c.code}</p>
                          <p className="text-[11px] text-neutral-500">
                            {c.status} · {c.points_spent} pts → ${Number(c.discount_amount).toFixed(2)}
                          </p>
                        </div>
                        <span className="text-xs text-neutral-600">
                          Used {c.uses}/{c.max_uses}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <PageBottomCta
        headline="Need a hand with rewards or an order?"
        body="We read every message — reach out on the contact form or Instagram."
      />
    </div>
  )
}

