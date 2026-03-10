import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [done, setDone] = useState(false)
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    if (!sessionId || done) return
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/.netlify/functions/decrement-stock-after-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        if (!cancelled && res.ok) {
          clearCart()
        }
      } catch (e) {
        console.error('Error decrementing stock:', e)
      } finally {
        if (!cancelled) setDone(true)
      }
    }
    run()
    return () => { cancelled = true }
  }, [sessionId, done, clearCart])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-3xl text-neutral-800 mb-2">Thank you for your order</h1>
        <p className="text-neutral-600 mb-8">
          Your payment was successful. We&apos;ve updated stock and will process your order shortly.
        </p>
        <Link to="/shop" className="btn-primary inline-block">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
