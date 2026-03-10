// Shop Magari categories – used in Shop page and Admin product upload
export const SHOP_MAGARI_CATEGORIES = [
  'Kitchen & Tabletop',
  'Throw Pillows and Blankets',
  'Candles and Holders',
  'Nativities',
]

export const SHIPPING_OPTIONS = [
  'Ships from San Juan, PR to USA & PR',
  'Ships from Austin, TX to USA',
  'US only',
  'Local pickup only (Georgetown, TX)',
  'International shipping available',
  'Digital product – no shipping',
]

// Fulfillment: what options this product supports. Drives checkout (address required, shipping vs delivery cost).
export const FULFILLMENT_OPTIONS = [
  { value: 'local_pickup_only', label: 'Local pickup only (Georgetown, TX)' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'delivery', label: 'Delivery (within 30 miles)' },
  { value: 'shipping_and_delivery', label: 'Shipping & delivery' },
]

export const PICKUP_ADDRESS = '75 Jan Ln, Georgetown, TX'
export const PICKUP_DISPLAY = 'Pickup in Georgetown, TX. Full address (75 Jan Ln, Georgetown, TX) will be provided after payment.'

export const RETURN_POLICY_OPTIONS = [
  '30-day returns accepted',
  '14-day returns accepted',
  'Final sale – no returns',
  'Exchange only within 14 days',
  'Contact us for returns',
]
