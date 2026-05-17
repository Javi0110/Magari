import { describe, expect, it } from 'vitest'
import {
  isLikelySupabaseProductId,
  rowToVendorProduct,
  vendorProductToDbRow,
} from './marketplaceProductDb.js'

describe('isLikelySupabaseProductId', () => {
  it('accepts positive numeric ids', () => {
    expect(isLikelySupabaseProductId(42)).toBe(true)
    expect(isLikelySupabaseProductId('99')).toBe(true)
  })

  it('rejects local/vendor-prefixed ids', () => {
    expect(isLikelySupabaseProductId('v-abc')).toBe(false)
    expect(isLikelySupabaseProductId(0)).toBe(false)
  })
})

describe('rowToVendorProduct', () => {
  it('maps snake_case row to app shape', () => {
    const product = rowToVendorProduct({
      id: 1,
      title: 'Chair',
      price: 120,
      shipping_options: { delivery: true, prices: { delivery: 15 } },
      return_policy: '14-day returns',
    })
    expect(product.title).toBe('Chair')
    expect(product.returnPolicy).toBe('14-day returns')
    expect(product.shippingOptions.delivery).toBe(true)
    expect(product.shippingPrices.delivery).toBe(15)
  })
})

describe('vendorProductToDbRow', () => {
  it('maps app product to insert row', () => {
    const row = vendorProductToDbRow(
      { title: 'Lamp', price: 80, returnPolicy: '30-day', tags: ['maker'] },
      5,
      'studio-luna'
    )
    expect(row.vendor_id).toBe(5)
    expect(row.vendor).toBe('studio-luna')
    expect(row.return_policy).toBe('30-day')
  })
})
