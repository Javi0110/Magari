/**
 * Local delivery only within this radius of Magari pickup (75 Jan Ln, Georgetown, TX).
 * Coordinates are approximate center of that address for distance checks.
 */
const MAGARI_ORIGIN_LAT = 30.6569
const MAGARI_ORIGIN_LON = -97.7127
const MAX_DELIVERY_MILES = 30

function toRad(d) {
  return (d * Math.PI) / 180
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3959
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function geocodeNominatimQuery(freeformQuery) {
  const q = String(freeformQuery || '').trim()
  if (q.length < 5) return null
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MagariShop/1.0 (checkout; https://casamagari.com)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || !data.length) return null
  const lat = parseFloat(data[0].lat)
  const lon = parseFloat(data[0].lon)
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null
  return { lat, lon }
}

async function geocodeNominatim(address) {
  const parts = [
    address.line1,
    address.city,
    address.state,
    address.postal_code,
    'United States',
  ].filter((p) => p && String(p).trim())
  if (parts.length < 2) return null
  const q = parts.join(', ')
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MagariShop/1.0 (checkout; https://casamagari.com)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || !data.length) return null
  const lat = parseFloat(data[0].lat)
  const lon = parseFloat(data[0].lon)
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null
  return { lat, lon }
}

/**
 * @param {{ line1?: string, city?: string, state?: string, postal_code?: string }} address
 * @returns {Promise<{ ok: boolean, miles: number|null, error?: string }>}
 */
async function checkDeliveryWithinRadius(address) {
  const line1 = (address.line1 || '').trim()
  const city = (address.city || '').trim()
  const state = (address.state || '').trim()
  const postal_code = (address.postal_code || '').trim()
  if (line1.length < 3 || city.length < 2 || state.length < 2 || postal_code.length < 3) {
    return { ok: false, miles: null, error: 'Complete street, city, state, and ZIP for delivery.' }
  }
  const coords = await geocodeNominatim({ line1, city, state, postal_code })
  if (!coords) {
    return { ok: false, miles: null, error: 'We could not verify that address. Check the details or choose shipping or pickup.' }
  }
  const miles = haversineMiles(MAGARI_ORIGIN_LAT, MAGARI_ORIGIN_LON, coords.lat, coords.lon)
  if (miles > MAX_DELIVERY_MILES) {
    return {
      ok: false,
      miles: Math.round(miles * 10) / 10,
      error: `Delivery is only available within ${MAX_DELIVERY_MILES} miles of our Georgetown location. This address is about ${Math.round(miles * 10) / 10} miles away. Choose shipping or pickup instead.`,
    }
  }
  return { ok: true, miles: Math.round(miles * 10) / 10 }
}

/**
 * @param {{ line1?: string, city?: string, state?: string, postal_code?: string }} customerAddress
 * @param {string} originAddress freeform (vendor pickup / delivery origin)
 * @param {number} maxMiles
 */
async function checkDeliveryWithinRadiusFromOrigin(customerAddress, originAddress, maxMiles) {
  const line1 = (customerAddress.line1 || '').trim()
  const city = (customerAddress.city || '').trim()
  const state = (customerAddress.state || '').trim()
  const postal_code = (customerAddress.postal_code || '').trim()
  if (line1.length < 3 || city.length < 2 || state.length < 2 || postal_code.length < 3) {
    return { ok: false, miles: null, error: 'Complete street, city, state, and ZIP for delivery.' }
  }
  const originCoords = await geocodeNominatimQuery(originAddress)
  if (!originCoords) {
    return {
      ok: false,
      miles: null,
      error: 'We could not locate the seller delivery starting point. They may need to update their pickup or delivery address.',
    }
  }
  const destCoords = await geocodeNominatim({ line1, city, state, postal_code })
  if (!destCoords) {
    return { ok: false, miles: null, error: 'We could not verify that address. Check the details or choose shipping or pickup.' }
  }
  const miles = haversineMiles(originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon)
  const cap = Number(maxMiles)
  if (!(cap > 0)) {
    return { ok: false, miles: null, error: 'This seller has not set a valid delivery radius.' }
  }
  if (miles > cap) {
    return {
      ok: false,
      miles: Math.round(miles * 10) / 10,
      error: `This seller only delivers within ${cap} miles of their location. Your address is about ${Math.round(miles * 10) / 10} miles away.`,
    }
  }
  return { ok: true, miles: Math.round(miles * 10) / 10 }
}

/**
 * @param {object} shippingAddress
 * @param {{ requireMagari?: boolean, vendorChecks?: { originAddress: string, maxMiles: number, title?: string }[] }} opts
 */
async function validateAllDeliveryChecks(shippingAddress, opts = {}) {
  const requireMagari = opts.requireMagari === true
  const vendorChecks = Array.isArray(opts.vendorChecks) ? opts.vendorChecks : []

  if (!requireMagari && vendorChecks.length === 0) {
    const r = await checkDeliveryWithinRadius(shippingAddress)
    return r
  }

  if (requireMagari) {
    const r = await checkDeliveryWithinRadius(shippingAddress)
    if (!r.ok) return r
  }

  for (const v of vendorChecks) {
    const label = (v.title || 'A product in your cart').replace(/[<>]/g, '')
    const r = await checkDeliveryWithinRadiusFromOrigin(
      shippingAddress,
      v.originAddress,
      Number(v.maxMiles)
    )
    if (!r.ok) {
      return {
        ok: false,
        miles: r.miles,
        error: r.error ? `${r.error} (${label})` : `Delivery not available for ${label}.`,
      }
    }
  }

  return { ok: true, miles: null }
}

module.exports = {
  checkDeliveryWithinRadius,
  checkDeliveryWithinRadiusFromOrigin,
  validateAllDeliveryChecks,
  geocodeNominatimQuery,
  MAX_DELIVERY_MILES,
  MAGARI_ORIGIN_LAT,
  MAGARI_ORIGIN_LON,
}
