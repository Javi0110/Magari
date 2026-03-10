import { Link } from 'react-router-dom'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-2xl text-neutral-800 mb-2">Checkout cancelled</h1>
        <p className="text-neutral-600 mb-8">
          Your cart is still saved. You can continue shopping or come back to pay later.
        </p>
        <Link to="/shop" className="btn-primary inline-block mr-3">
          Continue shopping
        </Link>
        <Link to="/" className="btn-outline inline-block">
          Back to home
        </Link>
      </div>
    </div>
  )
}
