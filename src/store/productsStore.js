import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import { parseFulfillmentModes } from '../utils/fulfillment'

function parseJsonbArray(value, fallback) {
  if (value == null) return fallback
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]')
      return Array.isArray(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

// Mapear fila de Supabase (snake_case) a objeto app (camelCase)
function fromDb(row) {
  if (!row) return null
  const { return_policy, created_at, vendor_id, ...rest } = row
  const fulfillmentRaw = row.fulfillment || 'shipping'
  return {
    ...rest,
    returnPolicy: return_policy ?? rest.returnPolicy,
    createdAt: created_at ?? rest.createdAt,
    vendorId: vendor_id ?? rest.vendorId,
    fulfillment: fulfillmentRaw,
    fulfillmentModes: parseFulfillmentModes(fulfillmentRaw),
    images: parseJsonbArray(row.images, []),
    tags: parseJsonbArray(row.tags, ['magari']),
  }
}

// Payload for shop_products: only columns that exist in the table
const SHOP_PRODUCT_KEYS = [
  'slug', 'title', 'description', 'price', 'category', 'room', 'materials',
  'dimensions', 'images', 'tags', 'badge', 'stock', 'is_active', 'shipping', 'fulfillment'
]
const SHOP_PRODUCT_SELECT = [
  'id',
  'slug',
  'title',
  'description',
  'price',
  'category',
  'room',
  'materials',
  'dimensions',
  'images',
  'tags',
  'badge',
  'stock',
  'is_active',
  'created_at',
  'shipping',
  'fulfillment',
  'return_policy',
  'vendor_id',
].join(', ')

const fetchShopProducts = async () => {
  let result = await supabase
    .from('shop_products')
    .select(SHOP_PRODUCT_SELECT)
    .order('created_at', { ascending: false })

  // Fallback for older schemas missing one or more selected columns.
  if (result.error && result.error.code === '42703') {
    result = await supabase
      .from('shop_products')
      .select('*')
      .order('created_at', { ascending: false })
  }
  return result
}
function toDb(product) {
  const out = {}
  for (const key of SHOP_PRODUCT_KEYS) {
    if (product[key] !== undefined) out[key] = product[key]
  }
  if (product.returnPolicy !== undefined) out.return_policy = product.returnPolicy
  return out
}

const saveToStorage = (products) => {
  try {
    localStorage.setItem('magari-products-storage', JSON.stringify(products))
  } catch {
  }
}

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('magari-products-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch {
  }
  const empty = []
  saveToStorage(empty)
  return empty
}

export const useProductsStore = create((set, get) => ({
  products: loadFromStorage(),
  loading: false,
  error: null,
  initialized: false,
  
  initProducts: async () => {
    if (get().initialized) return
    if (!supabase) {
      set({ initialized: true })
      return
    }
    // Clear products so we never show stale/partial cache (e.g. one product); skeletons show while loading
    set({ loading: true, error: null, products: [] })
    const { data, error } = await fetchShopProducts()
    
    if (error) {
      console.error('initProducts error:', error)
      set({ loading: false, error: error.message, initialized: true })
      return
    }
    
    const products = (Array.isArray(data) ? data : []).map(fromDb)
    set({ products, loading: false, initialized: true })
    saveToStorage(products)
  },
  
  getAllProducts: () => {
    return get().products.filter(p => p.vendor === 'magari' || !p.vendor)
  },
  
  getProductById: (id) => {
    return get().products.find(p => p.id === id)
  },
  
  addProduct: async (product) => {
    if (!supabase) {
      const products = get().products
      const newId = Math.max(...products.map(p => p.id || 0), 0) + 1
      const newProduct = {
        ...product,
        id: newId,
        vendor: 'magari',
        tags: product.tags || ['magari'],
      }
      const updatedProducts = [...products, newProduct]
      set({ products: updatedProducts })
      saveToStorage(updatedProducts)
      return newProduct
    }
    
    const tags = product.tags && Array.isArray(product.tags) ? product.tags : (product.tags ? (typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : []) : ['magari'])
    const payload = toDb({
      ...product,
      vendor: 'magari',
      tags,
      images: product.images && Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
    })
    
    const { data, error } = await supabase
      .from('shop_products')
      .insert(payload)
      .select('*')
      .single()
    
    if (error) {
      console.error('shop_products insert error:', error)
      throw new Error(error.message || String(error.code || 'Could not save product to the database.'))
    }
    
    const newProduct = fromDb(data)
    const products = get().products
    const updatedProducts = [...products, newProduct]
    set({ products: updatedProducts, initialized: false })
    saveToStorage(updatedProducts)
    return newProduct
  },
  
  updateProduct: async (id, updates) => {
    if (!supabase) {
      const products = get().products
      const updatedProducts = products.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
      set({ products: updatedProducts })
      saveToStorage(updatedProducts)
      return updatedProducts.find(p => p.id === id)
    }
    
    const payload = toDb(updates)
    const { data, error } = await supabase
      .from('shop_products')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('shop_products update error:', error)
      throw new Error(error.message || String(error.code || 'Could not update product.'))
    }
    
    const updatedProduct = fromDb(data)
    const products = get().products
    const updatedProducts = products.map(product =>
      product.id === id ? updatedProduct : product
    )
    set({ products: updatedProducts })
    saveToStorage(updatedProducts)
    return updatedProduct
  },
  
  deleteProduct: async (id) => {
    if (supabase) {
      const { error } = await supabase
        .from('shop_products')
        .delete()
        .eq('id', id)
      if (error) {
        throw error
      }
    }
    const products = get().products.filter(p => p.id !== id)
    set({ products })
    saveToStorage(products)
  },
  
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

