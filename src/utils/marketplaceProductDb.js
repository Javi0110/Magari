/**
 * Map public.products row ↔ vendor dashboard / cart shape.
 */

export function isLikelySupabaseProductId(id) {
  if (id == null) return false
  const n = Number(id)
  return Number.isFinite(n) && n > 0 && !String(id).startsWith('v')
}

export function rowToVendorProduct(row) {
  let so = row.shipping_options
  if (typeof so === 'string') {
    try {
      so = JSON.parse(so)
    } catch {
      so = {}
    }
  }
  so = so && typeof so === 'object' ? so : {}
  const prices = so.prices || { delivery: 0, pickup: 0, shipping: 0 }
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    price: Number(row.price),
    category: row.category,
    room: row.room || 'Any',
    materials: row.materials || '',
    dimensions: row.dimensions || '',
    images: Array.isArray(row.images) ? row.images : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    stock: row.stock ?? 0,
    shipping: row.shipping || '',
    returnPolicy: row.return_policy || '30-day returns accepted',
    shippingOptions: {
      delivery: !!so.delivery,
      pickup: !!so.pickup,
      shipping: !!so.shipping,
    },
    shippingPrices: {
      delivery: Number(prices.delivery) || 0,
      pickup: Number(prices.pickup) || 0,
      shipping: Number(prices.shipping) || 0,
    },
    pickupLocation: so.pickupLocation || '',
    deliveryOriginAddress: so.deliveryOriginAddress || '',
    deliveryRadiusMiles: so.deliveryRadiusMiles ?? '',
    shipping_options: row.shipping_options,
    vendor_id: row.vendor_id,
  }
}

export function vendorProductToDbRow(pd, vendorId, vendorSlug) {
  return {
    title: pd.title,
    description: pd.description || '',
    price: pd.price,
    category: pd.category || 'Other',
    room: pd.room || 'Any',
    materials: pd.materials || '',
    dimensions: pd.dimensions || '',
    images: Array.isArray(pd.images) ? pd.images : [],
    tags: Array.isArray(pd.tags) ? pd.tags : ['maker'],
    vendor: String(vendorSlug || 'maker'),
    shipping: pd.shipping || '',
    return_policy: pd.returnPolicy || '30-day returns accepted',
    stock: pd.stock ?? 0,
    vendor_id: vendorId,
    shipping_options: pd.shipping_options && typeof pd.shipping_options === 'object' ? pd.shipping_options : {},
  }
}
