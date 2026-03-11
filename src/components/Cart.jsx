import { X, Minus, Plus, ShoppingBag, Tag, Truck, ArrowRight, MapPin } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { PICKUP_DISPLAY } from '../constants/shopCategories'

const SHIPPING_FLAT = 6.75
const SHIPPING_EXPEDITED = 13.65
const DELIVERY_FLAT = 10

export default function Cart() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const [checkingOut, setCheckingOut] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [rewardCode, setRewardCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingZip, setShippingZip] = useState('')
  const [fulfillmentMethod, setFulfillmentMethod] = useState('shipping')
  const [abandonedStatus, setAbandonedStatus] = useState(null)

  const totalItemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0)
  const allPickupOnly = items.length > 0 && items.every((i) => (i.fulfillment || 'shipping') === 'local_pickup_only')
  const canShip = items.some((i) => {
    const f = i.fulfillment || 'shipping'
    return f === 'shipping' || f === 'shipping_and_delivery'
  })
  const canDeliver = items.some((i) => {
    const f = i.fulfillment || 'shipping'
    return f === 'delivery' || f === 'shipping_and_delivery'
  })
  const needsAddress = items.length > 0 && !allPickupOnly

  useEffect(() => {
    if (needsAddress && !canShip && canDeliver && fulfillmentMethod === 'shipping') {
      setFulfillmentMethod('delivery')
    }
  }, [needsAddress, canShip, canDeliver, fulfillmentMethod])

  const subtotal = getTotal()
  const shippingCost = subtotal >= 60 || totalItemCount <= 0 ? 0 : SHIPPING_FLAT
  const expeditedCost = subtotal >= 60 || totalItemCount <= 0 ? 0 : SHIPPING_EXPEDITED
  const deliveryCost = DELIVERY_FLAT
  const fulfillmentAmount =
    allPickupOnly
      ? 0
      : fulfillmentMethod === 'delivery'
      ? deliveryCost
      : fulfillmentMethod === 'shipping'
      ? shippingCost
      : fulfillmentMethod === 'expedited'
      ? expeditedCost
      : 0

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'magari10') {
      setAppliedPromo({ code: promoCode, discount: 0.1 })
      setPromoCode('')
    } else {
      alert('Invalid promo code')
    }
  }

  const getSubtotal = () => getTotal()
  const getDiscount = () => (appliedPromo ? getSubtotal() * appliedPromo.discount : 0)
  const getFinalTotal = () => getSubtotal() - getDiscount() + fulfillmentAmount

  const hasValidShippingAddress = () =>
    (shippingAddress || '').trim().length >= 5 &&
    (shippingCity || '').trim().length >= 2 &&
    (shippingState || '').trim().length >= 2 &&
    (shippingZip || '').trim().length >= 3

  const handleSaveAbandonedCart = async () => {
    const email = (customerEmail || '').trim()
    if (!email) {
      alert('Add your email above so we can send your cart later.')
      return
    }
    if (!supabase) {
      alert('Cart saved locally on this device only. Connect Supabase to save it to your account.')
      return
    }
    try {
      setAbandonedStatus('saving')
      const { error } = await supabase.from('abandoned_carts').insert({
        email,
        cart: items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          vendorId: i.vendorId ?? i.vendor_id,
        })),
      })
      if (error) {
        console.error('Error saving abandoned cart:', error)
        setAbandonedStatus('error')
        alert('We could not save your cart right now. Please try again later.')
        return
      }
      setAbandonedStatus('saved')
      alert('We saved your cart. You can come back to it later.')
    } catch (err) {
      console.error('Error saving abandoned cart:', err)
      setAbandonedStatus('error')
      alert('We could not save your cart right now. Please try again later.')
    }
  }

  const handleCheckout = async () => {
    const name = (customerName || '').trim()
    const email = (customerEmail || '').trim()
    if (!name || !email) {
      alert('Please enter your name and email to continue.')
      return
    }
    if (needsAddress) {
      if (!hasValidShippingAddress()) {
        alert('Please complete the shipping address (street, city, state, and ZIP code).')
        return
      }
      if (fulfillmentMethod !== 'shipping' && fulfillmentMethod !== 'delivery') {
        alert('Please select Shipping or Delivery.')
        return
      }
    }
    setCheckingOut(true)
    try {
      const payload = {
        customerName: name,
        customerEmail: email,
        fulfillmentMethod: allPickupOnly ? 'local_pickup' : fulfillmentMethod,
        fulfillmentAmount: Math.round(fulfillmentAmount * 100) / 100,
        rewardCode: (rewardCode || '').trim(),
        items: items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          vendorId: i.vendorId ?? i.vendor_id,
          image: Array.isArray(i.images) && i.images.length > 0 ? i.images[0] : i.image || null,
        })),
      }
      if (needsAddress) {
        payload.shippingAddress = {
          line1: (shippingAddress || '').trim(),
          city: (shippingCity || '').trim(),
          state: (shippingState || '').trim(),
          postal_code: (shippingZip || '').trim(),
        }
      }
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout.')
      }
      window.location.href = data.url
    } catch (err) {
      console.error(err)
      alert(err.message || 'Could not start checkout. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="font-serif text-2xl text-neutral-600 flex items-center">
                <ShoppingBag className="w-6 h-6 mr-2" />
                Cart
              </h2>
              <button onClick={closeCart} className="p-2 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

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
                      <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-neutral-200">
                        {Array.isArray(item.images) && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-700 truncate">{item.title}</h3>
                        <p className="text-sage font-semibold mt-1">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
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

            {items.length > 0 && (
              <div className="border-t border-neutral-200 p-6 space-y-4">
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
                      Promo code &quot;{appliedPromo.code}&quot; applied! {Math.round(appliedPromo.discount * 100)}% off
                    </p>
                  )}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Rewards code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter rewards coupon"
                      value={rewardCode}
                      onChange={(e) => setRewardCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                    />
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Apply a code from your Magari Rewards Circle profile.
                    </p>
                  </div>
                </div>

                {/* Fulfillment: pickup only vs shipping/delivery */}
                {allPickupOnly && (
                  <div className="rounded-xl bg-sage/10 border border-sage/20 p-3 text-sm text-neutral-700">
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sage" />
                      Local pickup only
                    </p>
                    <p className="mt-1 text-neutral-600">{PICKUP_DISPLAY}</p>
                  </div>
                )}
                {needsAddress && (canShip || canDeliver) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Shipping or delivery
                    </p>
                    <div className="space-y-2">
                      {canShip && (
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-greige-light hover:border-sage/50 cursor-pointer">
                          <input
                            type="radio"
                            name="fulfillment"
                            checked={fulfillmentMethod === 'shipping'}
                            onChange={() => setFulfillmentMethod('shipping')}
                            className="text-sage"
                          />
                          <span className="text-sm">
                            Shipping — ${SHIPPING_FLAT.toFixed(2)} flat, free over $60
                          </span>
                        </label>
                      )}
                      {canShip && (
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-greige-light hover:border-sage/50 cursor-pointer">
                          <input
                            type="radio"
                            name="fulfillment"
                            checked={fulfillmentMethod === 'expedited'}
                            onChange={() => setFulfillmentMethod('expedited')}
                            className="text-sage"
                          />
                          <span className="text-sm">
                            Expedited — ${SHIPPING_EXPEDITED.toFixed(2)}
                          </span>
                        </label>
                      )}
                      {canDeliver && (
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-greige-light hover:border-sage/50 cursor-pointer">
                          <input
                            type="radio"
                            name="fulfillment"
                            checked={fulfillmentMethod === 'delivery'}
                            onChange={() => setFulfillmentMethod('delivery')}
                            className="text-sage"
                          />
                          <span className="text-sm">Delivery — ${deliveryCost} flat (within 30 miles)</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}

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
                  {fulfillmentAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">
                        {fulfillmentMethod === 'delivery'
                          ? 'Delivery:'
                          : fulfillmentMethod === 'expedited'
                          ? 'Expedited shipping:'
                          : 'Shipping:'}
                      </span>
                      <span className="text-neutral-700">${fulfillmentAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {subtotal >= 60 && (
                    <p className="text-xs text-sage pt-1">
                      You&apos;ve unlocked free shipping on this order.
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                    <span className="font-semibold text-neutral-700">Total:</span>
                    <span className="font-serif text-2xl text-neutral-700">${getFinalTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <label className="block text-sm font-medium text-neutral-700">Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="input-field text-sm"
                  />
                  <label className="block text-sm font-medium text-neutral-700">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="input-field text-sm"
                  />
                  {needsAddress && (
                    <>
                      <p className="text-xs font-medium text-neutral-600 pt-2 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Shipping address *
                      </p>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street address"
                        className="input-field text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="City"
                          className="input-field text-sm"
                        />
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          placeholder="State"
                          className="input-field text-sm"
                        />
                        <input
                          type="text"
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          placeholder="ZIP"
                          className="input-field text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 text-center">
                    Ships to USA &amp; PR. Payment is processed securely via Stripe; we&apos;ll reach out to coordinate
                    shipping or pickup.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveAbandonedCart}
                    disabled={abandonedStatus === 'saving'}
                    className="w-full text-xs text-neutral-600 hover:text-sage underline underline-offset-2 disabled:opacity-60"
                  >
                    {abandonedStatus === 'saved'
                      ? 'Cart saved. You can return to it later.'
                      : 'Not ready to check out? Save this cart to come back later.'}
                  </button>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? 'Processing…' : 'Proceed to checkout'}
                </button>

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
