import { supabase } from './supabase'

/**
 * Active listings for the public Real Estate page.
 * @returns {{ data: object[], error: { message: string } | null }}
 */
export async function fetchActiveRealtorListings() {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('realtor_listings')
    .select(
      'id, headline, price_display, address_display, summary, beds, baths, sqft, listing_url, cover_image_url, gallery_urls, sort_order, created_at'
    )
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
