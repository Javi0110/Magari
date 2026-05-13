/** Supabase Storage bucket (see migration 20260514120000_realtor_listings_storage.sql). */
export const REALTOR_LISTINGS_BUCKET = 'realtor-listings'

const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'])

function extensionForFile(file) {
  const fromName = (file?.name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
  if (ALLOWED_EXT.has(fromName)) return fromName === 'jpeg' ? 'jpg' : fromName
  const mime = (file?.type || '').toLowerCase()
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/avif') return 'avif'
  return 'jpg'
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} listingId UUID
 * @param {File} file
 * @param {{ folder?: 'cover' | 'gallery' }} opts
 */
export async function uploadRealtorListingImage(supabase, listingId, file, opts = {}) {
  const folder = opts.folder === 'cover' ? 'cover' : 'gallery'
  if (!supabase || !listingId || !file) {
    return { url: null, error: new Error('Falta supabase, listing o archivo.') }
  }
  const ext = extensionForFile(file)
  const path = `${listingId}/${folder}/${crypto.randomUUID()}.${ext}`
  const { data, error } = await supabase.storage.from(REALTOR_LISTINGS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) return { url: null, error }
  const { data: pub } = supabase.storage.from(REALTOR_LISTINGS_BUCKET).getPublicUrl(data.path)
  return { url: pub.publicUrl, error: null }
}
