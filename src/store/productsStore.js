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
  if (String(error.code || '') === '57014') return true
  const m = String(error.message || '').toLowerCase()
  return m.includes('statement timeout') || m.includes('canceling statement due to statement timeout')
}

/** PostgREST/Postgres: column missing, bad select list, schema cache. */
function isRecoverableSelectListError(error) {
  if (!error) return false
  const c = String(error.code || '')
  const m = String(error.message || '').toLowerCase()
  if (c === '42703') return true
  if (c === 'PGRST204') return true
  if (isMissingFulfillmentColumnError(error)) return true
  if (m.includes('does not exist') && m.includes('column')) return true
  if (m.includes('could not find') && m.includes('column')) return true
  return false
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
export function fromDb(row) {
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

/** Solo columnas del esquema base de shop_products (evita 400 si faltan columnas nuevas). */
const SHOP_PRODUCT_SELECT_MINIMAL = [
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
].join(', ')
const SHOP_PRODUCTS_FETCH_LIMIT = 500

const sortProductsByCreatedAtDesc = (rows) =>
  [...rows].sort(
    (a, b) =>
      new Date(b?.created_at || b?.createdAt || 0).getTime() -
      new Date(a?.created_at || a?.createdAt || 0).getTime()
  )

function isRpcCatalogMissingError(error) {
  if (!error) return false
  const msg = String(error.message || '').toLowerCase()
  return (
    msg.includes('could not find the function') ||
    msg.includes('function public.get_shop_products_catalog') ||
    String(error.code || '') === '42883'
  )
}

/**
 * RPC primero: en DB usa ORDER BY id (PK) y statement_timeout más alto (ver migración).
 * PostgREST solo como respaldo; reintentos solo con ORDER BY id para no encadenar timeouts por created_at.
 */
async function runShopProductsSelect(selectList) {
  const attempts = [
    (q) => q.order('id', { ascending: false }).limit(SHOP_PRODUCTS_FETCH_LIMIT),
    (q) => q.order('id', { ascending: false }).limit(200),
    (q) => q.order('id', { ascending: false }).limit(100),
  ]

  let result
  for (const finish of attempts) {
    const base = supabase.from('shop_products').select(selectList)
    result = await finish(base)
    if (!result.error) return result
    if (!isStatementTimeoutError(result.error)) return result
  }
  return result
}

async function fetchShopProductsViaRpc() {
  const limits = [SHOP_PRODUCTS_FETCH_LIMIT, 200, 100]
  let last
  for (const p_limit of limits) {
    const r = await supabase.rpc('get_shop_products_catalog', { p_limit })
    last = r
    if (!r.error && Array.isArray(r.data)) return r
    if (isRpcCatalogMissingError(r.error)) {
      return r
    }
  }
  return last
}

async function fetchShopProductsPrimaryRpc() {
  return supabase.rpc('get_shop_products_catalog', { p_limit: SHOP_PRODUCTS_FETCH_LIMIT })
}

export const fetchShopProducts = async () => {
  if (!supabase) {
    return { data: null, error: new Error(SUPABASE_REQUIRED_MSG) }
  }

  const rpcFirst = await fetchShopProductsPrimaryRpc()
  if (!rpcFirst.error && Array.isArray(rpcFirst.data)) {
    return { ...rpcFirst, data: sortProductsByCreatedAtDesc(rpcFirst.data) }
  }
  if (rpcFirst.error && !isRpcCatalogMissingError(rpcFirst.error) && !isStatementTimeoutError(rpcFirst.error)) {
    return rpcFirst
  }

  const selectVariants = [SHOP_PRODUCT_SELECT, SHOP_PRODUCT_SELECT_MINIMAL, '*']

  let result = rpcFirst
  for (const selectList of selectVariants) {
    result = await runShopProductsSelect(selectList)
    if (!result.error) {
      return { ...result, data: sortProductsByCreatedAtDesc(result.data) }
    }
    if (isRecoverableSelectListError(result.error) || isStatementTimeoutError(result.error)) {
      continue
    }
    break
  }

  if (result?.error && isStatementTimeoutError(result.error)) {
    const rpcFallback = await fetchShopProductsViaRpc()
    if (!rpcFallback.error && Array.isArray(rpcFallback.data)) {
      return { ...rpcFallback, data: sortProductsByCreatedAtDesc(rpcFallback.data) }
    }
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
    /* ignore quota / private mode */
  }
}

/** Evita bloquear el hilo principal tras descargar catálogos grandes. */
const scheduleSaveCatalogToStorage = (products) => {
  const run = () => saveToStorage(products)
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => run(), { timeout: 2500 })
  } else {
    setTimeout(run, 0)
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
    /* ignore corrupt cache */
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
  /** True while the shop catalog request is in flight (avoids showing a stale product count). */
  catalogFetchPending: false,

  initProducts: async (opts) => {
    const force = opts?.force === true
    if (get().initialized && !force) return
    if (!supabase) {
      set({ initialized: true, catalogFetchPending: false })
      return
    }
    const hadProducts = Array.isArray(get().products) && get().products.length > 0
    // Con datos en memoria/localStorage: refrescar sin pantalla de carga bloqueante
    if (force || !hadProducts) {
      set({ loading: true, error: null, catalogFetchPending: true })
    } else {
      set({ error: null, catalogFetchPending: true })
    }

    try {
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
      scheduleSaveCatalogToStorage(products)
    } finally {
      set({ catalogFetchPending: false })
    }
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

