import { supabase } from './supabase'

const ACTIVE_LISTING_COLUMNS =
  'id, headline, price_display, address_display, summary, beds, baths, sqft, listing_url, cover_image_url, gallery_urls, sort_order, created_at'

/**
 * Active listings for the public Real Estate page.
 * Prefers RPC (reliable for anon); falls back to table if RPC is not deployed yet.
 * @returns {{ data: object[], error: { message: string, code?: string } | null }}
 */
export async function fetchActiveRealtorListings() {
  if (!supabase) return { data: [], error: null }

  const rpc = await supabase.rpc('get_active_realtor_listings')
  if (!rpc.error) {
    return { data: Array.isArray(rpc.data) ? rpc.data : [], error: null }
  }

  const missingFn =
    rpc.error &&
    (rpc.error.code === 'PGRST202' ||
      String(rpc.error.message || '').toLowerCase().includes('could not find') ||
      String(rpc.error.message || '').toLowerCase().includes('schema cache'))

  if (!missingFn) {
    return { data: [], error: rpc.error }
  }

  const { data, error } = await supabase
    .from('realtor_listings')
    .select(ACTIVE_LISTING_COLUMNS)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

/** Normalize gallery_urls from DB (jsonb array or null). */
export function normalizeGalleryUrls(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((u) => typeof u === 'string' && u.trim())
  return []
}
