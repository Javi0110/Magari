import { describe, expect, it } from 'vitest'
import {
  cartAllPickupOnly,
  cartCanDeliver,
  cartCanShip,
  itemFulfillmentModes,
  parseFulfillmentModes,
  serializeFulfillmentModes,
} from './fulfillment.js'

describe('parseFulfillmentModes', () => {
  it('defaults empty to shipping', () => {
    expect(parseFulfillmentModes(null)).toEqual(['shipping'])
    expect(parseFulfillmentModes('')).toEqual(['shipping'])
  })

  it('parses JSON array in canonical order', () => {
    expect(parseFulfillmentModes('["delivery","shipping"]')).toEqual(['shipping', 'delivery'])
  })

  it('maps legacy shipping_and_delivery', () => {
    expect(parseFulfillmentModes('shipping_and_delivery')).toEqual(['delivery', 'shipping'])
  })
})

describe('serializeFulfillmentModes', () => {
  it('normalizes and JSON-encodes modes', () => {
    expect(serializeFulfillmentModes(['shipping', 'delivery', 'shipping'])).toBe(
      '["shipping","delivery"]'
    )
  })
})

describe('itemFulfillmentModes', () => {
  it('reads vendor shippingOptions', () => {
    const modes = itemFulfillmentModes({
      shippingOptions: { delivery: true, shipping: false, pickup: false },
    })
    expect(modes).toContain('delivery')
  })
})

describe('cart helpers', () => {
  it('detects pickup-only cart', () => {
    const items = [{ fulfillment: 'local_pickup_only' }]
    expect(cartAllPickupOnly(items)).toBe(true)
    expect(cartCanShip(items)).toBe(false)
    expect(cartCanDeliver(items)).toBe(false)
  })

  it('detects mixed fulfillment', () => {
    const items = [{ fulfillment: 'shipping' }, { fulfillment: 'delivery' }]
    expect(cartAllPickupOnly(items)).toBe(false)
    expect(cartCanShip(items)).toBe(true)
    expect(cartCanDeliver(items)).toBe(true)
  })
})
