import { Link } from 'react-router-dom'
import InstagramDmCta from '../components/InstagramDmCta'
import PageBottomCta from '../components/PageBottomCta'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-2xl text-neutral-800 mb-2">Checkout cancelled</h1>
          <p className="text-neutral-600 mb-8">
            Your cart is still saved. You can continue shopping or come back to pay later.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap mb-4">
            <Link to="/shop" className="btn-primary">
              Continue shopping
            </Link>
            <Link to="/" className="btn-outline">
              Back to home
            </Link>
            <InstagramDmCta className="btn-outline" />
          </div>
        </div>
      </div>
      <PageBottomCta headline="Changed your mind?" body="We are here when you are ready — shop, book, or DM us on Instagram." />
    </div>
  )
}
