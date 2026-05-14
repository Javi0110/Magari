/**
 * Reduce image dimensions and JPEG quality so product rows stay small in Postgres/Supabase.
 * Huge base64 data URLs trigger "The quota has been exceeded" on many plans.
 */

const DEFAULT_OPTS = {
  maxEdge: 1600,
  maxBytes: 750_000,
  initialQuality: 0.82,
  minQuality: 0.45,
}

/**
 * @param {File} file
 * @param {Partial<typeof DEFAULT_OPTS>} opts
 * @returns {Promise<File>}
 */
export async function compressImageForUpload(file, opts = {}) {
  if (!file || !file.type?.startsWith('image/')) return file
  const { maxEdge, maxBytes, initialQuality, minQuality } = { ...DEFAULT_OPTS, ...opts }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  try {
    let { width, height } = bitmap
    const scale = Math.min(1, maxEdge / Math.max(width, height, 1))
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    let quality = initialQuality
    let blob = null
    for (let step = 0; step < 8; step++) {
      blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
      })
      if (blob && blob.size <= maxBytes) break
      quality = Math.max(minQuality, quality * 0.82)
      if (!blob || quality <= minQuality) break
    }

    if (!blob || blob.size > maxBytes * 1.25) {
      return file
    }

    const base = (file.name || 'photo').replace(/\.[^/.]+$/, '')
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    bitmap.close()
  }
}
