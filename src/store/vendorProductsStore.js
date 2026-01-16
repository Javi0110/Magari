import { create } from 'zustand'
import { sampleVendors } from '../data/sampleData'

// Helper to save vendor products to localStorage
const saveVendorProducts = (vendorId, products) => {
  const allVendorProducts = loadAllVendorProducts()
  allVendorProducts[vendorId] = products
  localStorage.setItem('magari-vendor-products-storage', JSON.stringify(allVendorProducts))
}

// Helper to load all vendor products
const loadAllVendorProducts = () => {
  try {
    const stored = localStorage.getItem('magari-vendor-products-storage')
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with sample vendor products
    const initial = {}
    sampleVendors.forEach(vendor => {
      initial[vendor.slug] = vendor.products || []
    })
    saveAllVendorProducts(initial)
    return initial
  } catch {
    return {}
  }
}

const saveAllVendorProducts = (all) => {
  localStorage.setItem('magari-vendor-products-storage', JSON.stringify(all))
}

// Vendor Products Store
export const useVendorProductsStore = create((set, get) => ({
  // Get products for a specific vendor
  getVendorProducts: (vendorSlug) => {
    const all = loadAllVendorProducts()
    return all[vendorSlug] || []
  },
  
  // Add product for a vendor
  addVendorProduct: (vendorSlug, product) => {
    const all = loadAllVendorProducts()
    const vendorProducts = all[vendorSlug] || []
    const newId = `v${vendorSlug}-${Date.now()}`
    const newProduct = {
      ...product,
      id: newId,
      vendor: vendorSlug,
      vendorName: product.vendorName || vendorSlug,
      tags: product.tags || ['maker'],
      stock: product.stock || 0,
    }
    const updatedProducts = [...vendorProducts, newProduct]
    saveVendorProducts(vendorSlug, updatedProducts)
    return newProduct
  },
  
  // Update vendor product
  updateVendorProduct: (vendorSlug, productId, updates) => {
    const all = loadAllVendorProducts()
    const vendorProducts = all[vendorSlug] || []
    const updatedProducts = vendorProducts.map(p =>
      p.id === productId ? { ...p, ...updates } : p
    )
    saveVendorProducts(vendorSlug, updatedProducts)
    return updatedProducts.find(p => p.id === productId)
  },
  
  // Delete vendor product
  deleteVendorProduct: (vendorSlug, productId) => {
    const all = loadAllVendorProducts()
    const vendorProducts = (all[vendorSlug] || []).filter(p => p.id !== productId)
    saveVendorProducts(vendorSlug, vendorProducts)
  },
  
  // Get vendor stats
  getVendorStats: (vendorSlug) => {
    const products = get().getVendorProducts(vendorSlug)
    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0),
      totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
      byCategory: products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {}),
    }
  },
}))

