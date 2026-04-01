/** Canonical mode keys stored per product (JSON array in shop_products.fulfillment). */
export const FULFILLMENT_MODE_KEYS = ['local_pickup_only', 'shipping', 'delivery']

export const FULFILLMENT_MODE_LABELS = {
  local_pickup_only: 'Local pickup (Georgetown, TX)',
  shipping: 'Shipping',
  delivery: 'Local delivery (within 30 miles of 75 Jan Ln, Georgetown, TX)',
}

/**
 * Parse DB / legacy string into a unique sorted list of modes.
 * @param {string|undefined|null} raw
 * @returns {string[]}
 */
export function parseFulfillmentModes(raw) {
  if (raw == null || raw === '') return ['shipping']
  const s = String(raw).trim()
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s)
      if (Array.isArray(arr)) {
        const norm = arr.map((x) => String(x).trim()).filter(Boolean)
        return normalizeModes(norm)
      }
    } catch {
      /* fall through */
    }
  }
  if (s === 'shipping_and_delivery') return ['delivery', 'shipping']
  if (FULFILLMENT_MODE_KEYS.includes(s)) return [s]
  return ['shipping']
}

function normalizeModes(modes) {
  const set = new Set()
  for (const m of modes) {
    if (m === 'shipping_and_delivery') {
      set.add('shipping')
      set.add('delivery')
    } else if (FULFILLMENT_MODE_KEYS.includes(m)) {
      set.add(m)
    }
  }
  if (set.size === 0) set.add('shipping')
  return FULFILLMENT_MODE_KEYS.filter((k) => set.has(k))
}

export function serializeFulfillmentModes(modes) {
  const normalized = normalizeModes(Array.isArray(modes) ? modes : [])
  return JSON.stringify(normalized)
}

/** MOMade marketplace products store options in shippingOptions / shipping_options. */
function modesFromVendorShippingOptions(item) {
  const raw = item.shippingOptions ?? item.shipping_options
  if (!raw || typeof raw !== 'object') return null
  const delivery = !!raw.delivery
  const shipping = !!raw.shipping
  const pickup = !!raw.pickup
  if (!delivery && !shipping && !pickup) return null

  const modes = []
  if (delivery) modes.push('delivery')
  if (shipping) modes.push('shipping')
  if (pickup && !delivery && !shipping) modes.push('local_pickup_only')
  else if (pickup && (delivery || shipping)) modes.push('local_pickup_only')
  if (modes.length === 0) modes.push('shipping')
  return normalizeModes(modes)
}

/** Modes for a cart line or product (supports legacy single string). */
export function itemFulfillmentModes(item) {
  if (!item) return ['shipping']
  const vendorModes = modesFromVendorShippingOptions(item)
  if (vendorModes) return vendorModes
  if (Array.isArray(item.fulfillmentModes) && item.fulfillmentModes.length > 0) {
    return normalizeModes(item.fulfillmentModes)
  }
  return parseFulfillmentModes(item.fulfillment)
}

export function itemSupportsDeliveryForCheckout(item) {
  return itemFulfillmentModes(item).includes('delivery')
}

/** Address string used as geocode origin for vendor local delivery (miles from here). */
export function getVendorDeliveryOrigin(item) {
  const so = item.shippingOptions ?? item.shipping_options ?? {}
  const pickupOn = !!so.pickup
  const pickup = String(item.pickupLocation ?? so.pickupLocation ?? '').trim()
  const deliveryOrigin = String(item.deliveryOriginAddress ?? so.deliveryOriginAddress ?? '').trim()
  if (pickupOn && pickup) return pickup
  return deliveryOrigin || pickup
}

export function normalizeMarketplaceProductForCart(p) {
  let so = p.shipping_options
  if (typeof so === 'string') {
    try {
      so = JSON.parse(so)
    } catch {
      so = {}
    }
  }
  so = so && typeof so === 'object' ? so : {}
  const opts = p.shippingOptions ?? {
    delivery: !!so.delivery,
    pickup: !!so.pickup,
    shipping: !!so.shipping,
  }
  const prices = p.shippingPrices ?? so.prices ?? { delivery: 0, pickup: 0, shipping: 0 }
  return {
    ...p,
    vendorId: p.vendorId ?? p.vendor_id,
    shippingOptions: opts,
    shippingPrices: prices,
    pickupLocation: p.pickupLocation ?? so.pickupLocation ?? '',
    deliveryOriginAddress: p.deliveryOriginAddress ?? so.deliveryOriginAddress ?? '',
    deliveryRadiusMiles: Number(p.deliveryRadiusMiles ?? so.deliveryRadiusMiles) || 0,
  }
}

/**
 * Build payload for validate-delivery-radius / create-checkout-session when method is delivery.
 */
export function buildDeliveryValidationPayload(items) {
  const requireMagari = items.some((i) => {
    const vid = i.vendorId ?? i.vendor_id
    if (vid) return false
    return itemSupportsDeliveryForCheckout(i)
  })

  const vendorChecks = []
  let badVendorConfig = false

  for (const i of items) {
    const vid = i.vendorId ?? i.vendor_id
    if (!vid || !itemSupportsDeliveryForCheckout(i)) continue

    const origin = getVendorDeliveryOrigin(i)
    const so = i.shippingOptions ?? i.shipping_options ?? {}
    const maxMiles = Number(i.deliveryRadiusMiles ?? so.deliveryRadiusMiles ?? 0)

    if (!origin || origin.length < 5 || !(maxMiles > 0)) {
      badVendorConfig = true
      continue
    }
    vendorChecks.push({
      originAddress: origin,
      maxMiles,
      title: i.title || 'A seller product',
    })
  }

  return {
    requireMagari,
    vendorChecks,
    badVendorConfig,
  }
}

export function cartAllPickupOnly(items) {
  if (!items.length) return false
  return items.every((i) => {
    const m = itemFulfillmentModes(i)
    return m.length === 1 && m[0] === 'local_pickup_only'
  })
}

export function cartCanShip(items) {
  return items.some((i) => itemFulfillmentModes(i).includes('shipping'))
}

export function cartCanDeliver(items) {
  return items.some((i) => itemFulfillmentModes(i).includes('delivery'))
}
