import { X, Minus, Plus, ShoppingBag, Tag, Truck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createOrderAndNotifications } from '../utils/orders'

export default function Cart() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const [checkingOut, setCheckingOut] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [showShipping, setShowShipping] = useState(false)
  const [shippingZip, setShippingZip] = useState('')
  const [estimatedShipping, setEstimatedShipping] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  const handleApplyPromo = () => {
    // 🔌 INTEGRATION: Validate promo code
    // const response = await fetch('/api/validate-promo', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code: promoCode })
    // })
    // const { valid, discount } = await response.json()
    
    // Mock validation for demo
    if (promoCode.toLowerCase() === 'magari10') {
      setAppliedPromo({ code: promoCode, discount: 0.1 })
      setPromoCode('')
    } else {
      alert('Invalid promo code')
    }
  }

  const handleEstimateShipping = () => {
    // 🔌 INTEGRATION: Calculate shipping
    // const response = await fetch('/api/estimate-shipping', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ zipCode: shippingZip, items })
    // })
    // const { cost, estimatedDays } = await response.json()
    
    // Mock estimation for demo
    if (shippingZip) {
      setEstimatedShipping({ cost: 12.99, estimatedDays: '3-5' })
    }
  }

  const getSubtotal = () => {
    return getTotal()
  }

  const getDiscount = () => {
    if (!appliedPromo) return 0
    return getSubtotal() * appliedPromo.discount
  }

  const getShipping = () => {
    return estimatedShipping?.cost || 0
  }

  const getFinalTotal = () => {
    return getSubtotal() - getDiscount() + getShipping()
  }

  const handleCheckout = async () => {
    const name = (customerName || '').trim()
    const email = (customerEmail || '').trim()
    if (!name || !email) {
      alert('Introduce tu nombre y email para continuar.')
      return
    }
    setCheckingOut(true)
    try {
      await createOrderAndNotifications({
        items: items.map(i => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          vendorId: i.vendorId ?? i.vendor_id
        })),
        total: getFinalTotal(),
        customerName: name,
        customerEmail: email,
        shippingAddress: shippingZip ? `ZIP: ${shippingZip}` : ''
      })
      clearCart()
      closeCart()
      setCustomerName('')
      setCustomerEmail('')
      alert('Pedido registrado. Te contactaremos para coordinar el pago y envío.')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error al registrar el pedido.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="font-serif text-2xl text-neutral-600 flex items-center">
                <ShoppingBag className="w-6 h-6 mr-2" />
                Cart
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-cream rounded-2xl"
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-neutral-200 rounded-xl flex-shrink-0" />

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-700 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sage font-semibold mt-1">
                          ${item.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-xs text-neutral-500 hover:text-earth transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t border-neutral-200 p-6 space-y-4">
                {/* Promo Code */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode || !!appliedPromo}
                      className="btn-outline px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-sm text-sage">
                      Promo code "{appliedPromo.code}" applied! {Math.round(appliedPromo.discount * 100)}% off
                    </p>
                  )}
                </div>

                {/* Shipping Estimate */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowShipping(!showShipping)}
                    className="w-full flex items-center justify-between text-sm text-neutral-600 hover:text-sage transition-colors"
                  >
                    <span className="flex items-center">
                      <Truck className="w-4 h-4 mr-2" />
                      Estimate shipping
                    </span>
                    {showShipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showShipping && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="ZIP code"
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                        />
                        <button
                          onClick={handleEstimateShipping}
                          disabled={!shippingZip}
                          className="btn-outline px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Calculate
                        </button>
                      </div>
                      {estimatedShipping && (
                        <p className="text-sm text-neutral-600">
                          ${estimatedShipping.cost.toFixed(2)} - {estimatedShipping.estimatedDays} business days
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="text-neutral-700">${getSubtotal().toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-sage">
                      <span>Discount ({Math.round(appliedPromo.discount * 100)}%):</span>
                      <span>-${getDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  {estimatedShipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Shipping:</span>
                      <span className="text-neutral-700">${getShipping().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                    <span className="font-semibold text-neutral-700">Total:</span>
                    <span className="font-serif text-2xl text-neutral-700">
                      ${getFinalTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <label className="block text-sm font-medium text-neutral-700">Nombre *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre"
                    className="input-field text-sm"
                  />
                  <label className="block text-sm font-medium text-neutral-700">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input-field text-sm"
                  />
                </div>

                <p className="text-xs text-neutral-500 text-center">
                  Ships to USA & PR. Te contactaremos para coordinar pago y envío.
                </p>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? 'Procesando…' : 'Confirmar pedido'}
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="block text-center text-sm text-neutral-600 hover:text-sage transition-colors"
                >
                  Continue shopping
                  <ArrowRight className="w-4 h-4 inline-block ml-1" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

