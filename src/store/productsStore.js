import { create } from 'zustand'
import { sampleProducts } from '../data/sampleData'

// Helper to save to localStorage
const saveToStorage = (products) => {
  localStorage.setItem('magari-products-storage', JSON.stringify(products))
}

// Helper to load from localStorage
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('magari-products-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Only return if it's a non-empty array
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
    // Initialize with empty array if no stored data
    const empty = []
    saveToStorage(empty)
    return empty
  } catch {
    const empty = []
    saveToStorage(empty)
    return empty
  }
}

// Products store with localStorage persistence
export const useProductsStore = create((set, get) => ({
  products: loadFromStorage(),
  
  // Get all products (only Magari products)
  getAllProducts: () => {
    return get().products.filter(p => p.vendor === 'magari')
  },
  
  // Get product by ID
  getProductById: (id) => {
    return get().products.find(p => p.id === id)
  },
  
  // Add new product
  addProduct: (product) => {
    const products = get().products
    const newId = Math.max(...products.map(p => p.id), 0) + 1
    const newProduct = {
      ...product,
      id: newId,
      vendor: 'magari', // Always magari for shop products
      tags: product.tags || ['magari'],
    }
    const updatedProducts = [...products, newProduct]
    set({ products: updatedProducts })
    saveToStorage(updatedProducts)
    return newProduct
  },
  
  // Update existing product
  updateProduct: (id, updates) => {
    const products = get().products
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates } : product
    )
    set({ products: updatedProducts })
    saveToStorage(updatedProducts)
    return updatedProducts.find(p => p.id === id)
  },
  
  // Delete product
  deleteProduct: (id) => {
    const products = get().products.filter(p => p.id !== id)
    set({ products })
    saveToStorage(products)
  },
  
  // Get inventory stats
  getInventoryStats: () => {
    const products = get().getAllProducts()
    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
      byCategory: products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {}),
      byRoom: products.reduce((acc, p) => {
        acc[p.room] = (acc[p.room] || 0) + 1
        return acc
      }, {}),
    }
  },
}))

