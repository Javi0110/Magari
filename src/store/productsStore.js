import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import { parseFulfillmentModes } from '../utils/fulfillment'

const SUPABASE_REQUIRED_MSG =
  'Supabase no está configurado (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env). Reinicia npm run dev tras guardar .env.'

/** PostgREST when a column exists in app but not in DB (migration not applied). */
function isMissingFulfillmentColumnError(error) {
  if (!error) return false
  const m = String(error.message || '').toLowerCase()
  return m.includes('fulfillment') && (m.includes('schema cache') || m.includes('could not find'))
}

function isStatementTimeoutError(error) {
  if (!error) return false
  const m = String(error.message || '').toLowerCase()
  return m.includes('statement timeout') || m.includes('canceling statement due to statement timeout')
}

function omitFulfillmentFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload
  const { fulfillment: _f, ...rest } = payload
  return rest
}

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
const SHOP_PRODUCTS_FETCH_LIMIT = 500

const sortProductsByCreatedAtDesc = (rows) =>
  [...rows].sort(
    (a, b) =>
      new Date(b?.created_at || b?.createdAt || 0).getTime() -
      new Date(a?.created_at || a?.createdAt || 0).getTime()
  )

const fetchShopProducts = async () => {
  let result = await supabase
    .from('shop_products')
    .select(SHOP_PRODUCT_SELECT)
    .order('created_at', { ascending: false })
    .limit(SHOP_PRODUCTS_FETCH_LIMIT)

  // Some projects hit statement timeout on ORDER BY. Retry without ordering.
  if (result.error && isStatementTimeoutError(result.error)) {
    result = await supabase
      .from('shop_products')
      .select(SHOP_PRODUCT_SELECT)
      .limit(SHOP_PRODUCTS_FETCH_LIMIT)
  }

  // Fallback when DB is missing columns (Postgres 42703 or PostgREST schema cache for fulfillment, etc.)
  if (
    result.error &&
    (result.error.code === '42703' || isMissingFulfillmentColumnError(result.error))
  ) {
    result = await supabase
      .from('shop_products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SHOP_PRODUCTS_FETCH_LIMIT)
  }

  // Last retry path for timeout on fallback queries.
  if (result.error && isStatementTimeoutError(result.error)) {
    result = await supabase
      .from('shop_products')
      .select('*')
      .limit(SHOP_PRODUCTS_FETCH_LIMIT)
  }

  if (!result.error && Array.isArray(result.data)) {
    return { ...result, data: sortProductsByCreatedAtDesc(result.data) }
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
  
  initProducts: async (opts) => {
    const force = opts?.force === true
    if (get().initialized && !force) return
    if (!supabase) {
      set({ initialized: true })
      return
    }
    set({ loading: true, error: null })
    const { data, error } = await fetchShopProducts()

    if (error) {
      console.error('initProducts error:', error)
      const cached = loadFromStorage()
      const previous = get().products
      set({
        loading: false,
        error: error.message,
        initialized: true,
        products:
          Array.isArray(cached) && cached.length > 0
            ? cached
            : Array.isArray(previous)
              ? previous
              : [],
      })
      return
    }

    const products = (Array.isArray(data) ? data : []).map(fromDb)
    set({ products, loading: false, initialized: true, error: null })
    saveToStorage(products)
  },

  /** All rows from shop_products (Shop Magari should show full catalog). */
  getAllProducts: () => {
    return get().products
  },
  
  getProductById: (id) => {
    return get().products.find(p => p.id === id)
  },
  
  addProduct: async (product) => {
    if (!supabase) {
      throw new Error(SUPABASE_REQUIRED_MSG)
    }

    const tags = product.tags && Array.isArray(product.tags) ? product.tags : (product.tags ? (typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : []) : ['magari'])
    const payload = toDb({
      ...product,
      vendor: 'magari',
      tags,
      images: product.images && Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
    })

    let { data, error } = await supabase.from('shop_products').insert(payload).select('*')

    if (error && isMissingFulfillmentColumnError(error) && payload.fulfillment !== undefined) {
      const retry = await supabase
        .from('shop_products')
        .insert(omitFulfillmentFromPayload(payload))
        .select('*')
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('shop_products insert error:', error)
      const hint = isMissingFulfillmentColumnError(error)
        ? ' Ejecuta en Supabase → SQL Editor: alter table public.shop_products add column if not exists fulfillment text not null default \'shipping\';'
        : ''
      throw new Error((error.message || String(error.code || 'Could not save product to the database.')) + hint)
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      throw new Error(
        'El insert no devolvió filas. Comprueba en Supabase que exista la tabla public.shop_products y que las políticas RLS permitan INSERT y SELECT.'
      )
    }

    const newProduct = fromDb(row)
    const products = get().products
    const updatedProducts = [...products, newProduct]
    set({ products: updatedProducts, initialized: false })
    saveToStorage(updatedProducts)
    return newProduct
  },
  
  updateProduct: async (id, updates) => {
    if (!supabase) {
      throw new Error(SUPABASE_REQUIRED_MSG)
    }

    const payload = toDb(updates)
    let { data, error } = await supabase
      .from('shop_products')
      .update(payload)
      .eq('id', id)
      .select('*')

    if (error && isMissingFulfillmentColumnError(error) && payload.fulfillment !== undefined) {
      const retry = await supabase
        .from('shop_products')
        .update(omitFulfillmentFromPayload(payload))
        .eq('id', id)
        .select('*')
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('shop_products update error:', error)
      const hint = isMissingFulfillmentColumnError(error)
        ? ' Ejecuta en Supabase → SQL Editor: alter table public.shop_products add column if not exists fulfillment text not null default \'shipping\';'
        : ''
      throw new Error((error.message || String(error.code || 'Could not update product.')) + hint)
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      throw new Error(
        'No se pudo leer el producto actualizado. Comprueba el id y las políticas RLS de shop_products.'
      )
    }

    const updatedProduct = fromDb(row)
    const products = get().products
    const updatedProducts = products.map(product =>
      product.id === id ? updatedProduct : product
    )
    set({ products: updatedProducts })
    saveToStorage(updatedProducts)
    return updatedProduct
  },
  
  deleteProduct: async (id) => {
    if (!supabase) {
      throw new Error(SUPABASE_REQUIRED_MSG)
    }
    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', id)
    if (error) {
      throw new Error(error.message || String(error.code || 'Could not delete product.'))
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

