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

/** Modes for a cart line or product (supports legacy single string). */
export function itemFulfillmentModes(item) {
  if (!item) return ['shipping']
  if (Array.isArray(item.fulfillmentModes) && item.fulfillmentModes.length > 0) {
    return normalizeModes(item.fulfillmentModes)
  }
  return parseFulfillmentModes(item.fulfillment)
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
