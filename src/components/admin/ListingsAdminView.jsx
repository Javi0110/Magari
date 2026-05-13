import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, RefreshCw, Plus, Trash2, Save, ExternalLink, ImageUp, X } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { REALTOR_LISTING_STATUS_OPTIONS } from '../../constants/realtorListings'
import { normalizeGalleryUrls } from '../../utils/realtorListings'
import { uploadRealtorListingImage } from '../../utils/realtorListingStorage'

const emptyForm = () => ({
  headline: '',
  price_display: '',
  address_display: '',
  summary: '',
  beds: '',
  baths: '',
  sqft: '',
  listing_url: '',
  status: 'draft',
  sort_order: 0,
})

const numOrNull = (v) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function payloadCore(f) {
  return {
    headline: f.headline.trim(),
    price_display: f.price_display.trim(),
    address_display: f.address_display.trim(),
    summary: f.summary.trim(),
    beds: numOrNull(f.beds),
    baths: numOrNull(f.baths),
    sqft: (() => {
      const s = numOrNull(f.sqft)
      return s != null ? Math.round(s) : null
    })(),
    listing_url: f.listing_url.trim(),
    status: f.status,
    sort_order: Number(f.sort_order) || 0,
  }
}

export default function ListingsAdminView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newRow, setNewRow] = useState(emptyForm)
  const [createCoverFile, setCreateCoverFile] = useState(null)
  const [createGalleryFiles, setCreateGalleryFiles] = useState([])
  const [createCoverPreviewUrl, setCreateCoverPreviewUrl] = useState(null)
  const createCoverInputRef = useRef(null)
  const createGalleryInputRef = useRef(null)

  useEffect(() => {
    if (!createCoverFile) {
      setCreateCoverPreviewUrl(null)
      return
    }
    const u = URL.createObjectURL(createCoverFile)
    setCreateCoverPreviewUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [createCoverFile])

  const load = useCallback(async () => {
    if (!supabase) {
      setError('Supabase no configurado.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('realtor_listings')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar los listings. ¿Ejecutaste la migración y tienes sesión Supabase en Admin?')
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createListing = async (e) => {
    e.preventDefault()
    if (!supabase) return
    const core = payloadCore(newRow)
    if (!core.headline) {
      alert('Añade al menos un título (headline).')
      return
    }
    setCreating(true)
    const { data, error: insErr } = await supabase
      .from('realtor_listings')
      .insert({ ...core, cover_image_url: '', gallery_urls: [] })
      .select('*')
      .single()
    if (insErr) {
      setCreating(false)
      alert(insErr.message || 'Error al crear')
      return
    }
    const id = data.id
    let coverUrl = data.cover_image_url || ''
    const galleryUrls = normalizeGalleryUrls(data.gallery_urls)

    if (createCoverFile) {
      const { url, error: upErr } = await uploadRealtorListingImage(supabase, id, createCoverFile, { folder: 'cover' })
      if (upErr) {
        setCreating(false)
        alert(upErr.message || 'Error al subir la portada')
        setRows((prev) => [data, ...prev])
        setNewRow(emptyForm())
        setCreateCoverFile(null)
        setCreateGalleryFiles([])
        return
      }
      if (url) coverUrl = url
    }
    for (const file of createGalleryFiles) {
      const { url, error: gErr } = await uploadRealtorListingImage(supabase, id, file, { folder: 'gallery' })
      if (gErr) {
        alert(gErr.message || 'Error al subir una imagen de galería')
        break
      }
      if (url) galleryUrls.push(url)
    }

    let finalRow = data
    if (coverUrl || galleryUrls.length) {
      const { data: updated, error: upRowErr } = await supabase
        .from('realtor_listings')
        .update({ cover_image_url: coverUrl, gallery_urls: galleryUrls })
        .eq('id', id)
        .select('*')
        .single()
      if (!upRowErr && updated) finalRow = updated
    }

    setRows((prev) => [finalRow, ...prev])
    setNewRow(emptyForm())
    setCreateCoverFile(null)
    setCreateGalleryFiles([])
    if (createCoverInputRef.current) createCoverInputRef.current.value = ''
    if (createGalleryInputRef.current) createGalleryInputRef.current.value = ''
    setCreating(false)
  }

  const saveRow = async (id, patch) => {
    setSavingId(id)
    const { data, error: upErr } = await supabase.from('realtor_listings').update(patch).eq('id', id).select('*').single()
    setSavingId(null)
    if (upErr) {
      alert(upErr.message || 'Error al guardar')
      return
    }
    setRows((prev) => prev.map((r) => (r.id === id ? data : r)))
  }

  const deleteRow = async (id) => {
    if (!window.confirm('¿Eliminar este listing permanentemente?')) return
    const { error: delErr } = await supabase.from('realtor_listings').delete().eq('id', id)
    if (delErr) {
      alert(delErr.message || 'Error al eliminar')
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Cargando listings…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      )}

      <div className="rounded-2xl border border-greige-light bg-white p-6">
        <h2 className="font-serif text-xl text-neutral-800 mb-2">Añadir listing</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Solo los marcados <strong>Active</strong> aparecen en Real Estate. Sube fotos desde tu ordenador (bucket{' '}
          <code className="text-xs bg-cream px-1 rounded">realtor-listings</code> — ejecuta la migración de Storage en
          Supabase).
        </p>
        <form onSubmit={createListing} className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">Título</span>
            <input
              className="input-field mt-1"
              value={newRow.headline}
              onChange={(e) => setNewRow({ ...newRow, headline: e.target.value })}
              placeholder="p. ej. 4BR modern farmhouse — Georgetown"
              required
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-600">Precio (texto)</span>
            <input
              className="input-field mt-1"
              value={newRow.price_display}
              onChange={(e) => setNewRow({ ...newRow, price_display: e.target.value })}
              placeholder="$725,000"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-600">Estado</span>
            <select
              className="input-field mt-1"
              value={newRow.status}
              onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
            >
              {REALTOR_LISTING_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">Dirección (línea corta, público)</span>
            <input
              className="input-field mt-1"
              value={newRow.address_display}
              onChange={(e) => setNewRow({ ...newRow, address_display: e.target.value })}
              placeholder="Georgetown, TX"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">Resumen (opcional)</span>
            <textarea
              className="input-field mt-1 min-h-[72px]"
              value={newRow.summary}
              onChange={(e) => setNewRow({ ...newRow, summary: e.target.value })}
              placeholder="Una o dos frases para la tarjeta en la web."
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-600">Recámaras</span>
            <input
              type="number"
              step="0.5"
              className="input-field mt-1"
              value={newRow.beds}
              onChange={(e) => setNewRow({ ...newRow, beds: e.target.value })}
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-600">Baños</span>
            <input
              type="number"
              step="0.5"
              className="input-field mt-1"
              value={newRow.baths}
              onChange={(e) => setNewRow({ ...newRow, baths: e.target.value })}
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-600">Sq ft</span>
            <input
              type="number"
              className="input-field mt-1"
              value={newRow.sqft}
              onChange={(e) => setNewRow({ ...newRow, sqft: e.target.value })}
            />
          </label>
          <label>
            <span className="text-xs font-medium text-neutral-600">Orden (menor = primero)</span>
            <input
              type="number"
              className="input-field mt-1"
              value={newRow.sort_order}
              onChange={(e) => setNewRow({ ...newRow, sort_order: e.target.value })}
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">URL del listing (MLS / Realtor / etc.)</span>
            <input
              className="input-field mt-1"
              value={newRow.listing_url}
              onChange={(e) => setNewRow({ ...newRow, listing_url: e.target.value })}
              placeholder="https://"
            />
          </label>

          <div className="md:col-span-2 rounded-xl border border-greige-light bg-cream/40 p-4 space-y-4">
            <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Fotos</p>
            <div>
              <span className="text-xs font-medium text-neutral-600 block mb-2">Portada</span>
              <div className="flex flex-wrap items-center gap-3">
                {createCoverPreviewUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-greige-light shrink-0">
                    <img src={createCoverPreviewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/50 text-white"
                      onClick={() => {
                        setCreateCoverFile(null)
                        if (createCoverInputRef.current) createCoverInputRef.current.value = ''
                      }}
                      aria-label="Quitar portada"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <label className="btn-outline btn-sm cursor-pointer gap-2">
                  <ImageUp className="w-4 h-4" />
                  Elegir imagen
                  <input
                    ref={createCoverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      setCreateCoverFile(f || null)
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-600 block mb-2">Galería (varias)</span>
              <div className="flex flex-wrap gap-2 mb-2">
                {createGalleryFiles.map((f, i) => (
                  <span
                    key={`${f.name}-${i}`}
                    className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-greige-light max-w-[200px] truncate"
                    title={f.name}
                  >
                    {f.name}
                    <button
                      type="button"
                      className="text-neutral-500 hover:text-red-600 shrink-0"
                      onClick={() => setCreateGalleryFiles((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Quitar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <label className="btn-outline btn-sm cursor-pointer gap-2">
                <ImageUp className="w-4 h-4" />
                Añadir fotos
                <input
                  ref={createGalleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const list = e.target.files ? Array.from(e.target.files) : []
                    if (list.length) setCreateGalleryFiles((prev) => [...prev, ...list])
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={creating} className="btn-primary gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear listing
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={load} className="btn-outline btn-sm gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      <div className="space-y-6">
        {rows.length === 0 && <p className="text-neutral-500 text-sm">No hay listings todavía.</p>}
        {rows.map((row) => (
          <ListingEditorCard
            key={row.id}
            row={row}
            saving={savingId === row.id}
            onSave={(patch) => saveRow(row.id, patch)}
            onDelete={() => deleteRow(row.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ListingEditorCard({ row, saving, onSave, onDelete }) {
  const [form, setForm] = useState(() => ({
    headline: row.headline || '',
    price_display: row.price_display || '',
    address_display: row.address_display || '',
    summary: row.summary || '',
    beds: row.beds != null ? String(row.beds) : '',
    baths: row.baths != null ? String(row.baths) : '',
    sqft: row.sqft != null ? String(row.sqft) : '',
    listing_url: row.listing_url || '',
    cover_image_url: row.cover_image_url || '',
    gallery_urls: normalizeGalleryUrls(row.gallery_urls),
    status: row.status || 'draft',
    sort_order: row.sort_order ?? 0,
  }))
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const coverInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  useEffect(() => {
    setForm({
      headline: row.headline || '',
      price_display: row.price_display || '',
      address_display: row.address_display || '',
      summary: row.summary || '',
      beds: row.beds != null ? String(row.beds) : '',
      baths: row.baths != null ? String(row.baths) : '',
      sqft: row.sqft != null ? String(row.sqft) : '',
      listing_url: row.listing_url || '',
      cover_image_url: row.cover_image_url || '',
      gallery_urls: normalizeGalleryUrls(row.gallery_urls),
      status: row.status || 'draft',
      sort_order: row.sort_order ?? 0,
    })
  }, [row])

  const submit = (e) => {
    e.preventDefault()
    onSave({
      ...payloadCore(form),
      cover_image_url: form.cover_image_url.trim(),
      gallery_urls: form.gallery_urls,
    })
  }

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !supabase) return
    setUploadingCover(true)
    const { url, error: err } = await uploadRealtorListingImage(supabase, row.id, file, { folder: 'cover' })
    setUploadingCover(false)
    if (err) {
      alert(err.message || 'Error al subir portada')
      return
    }
    if (url) setForm((f) => ({ ...f, cover_image_url: url }))
  }

  const handleGalleryFiles = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (!files.length || !supabase) return
    setUploadingGallery(true)
    const next = [...form.gallery_urls]
    for (const file of files) {
      const { url, error: err } = await uploadRealtorListingImage(supabase, row.id, file, { folder: 'gallery' })
      if (err) {
        alert(err.message || 'Error al subir una imagen')
        break
      }
      if (url) next.push(url)
    }
    setForm((f) => ({ ...f, gallery_urls: next }))
    setUploadingGallery(false)
  }

  const removeGalleryUrl = (url) => {
    setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((u) => u !== url) }))
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-greige-light bg-white p-5 space-y-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs text-neutral-400 font-mono">{row.id}</p>
        <div className="flex gap-2">
          {row.listing_url && (
            <a
              href={row.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver portal
            </a>
          )}
          <button type="button" onClick={onDelete} className="btn-outline btn-sm text-red-700 border-red-200 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Título</span>
          <input className="input-field mt-1" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-medium text-neutral-600">Precio</span>
          <input className="input-field mt-1" value={form.price_display} onChange={(e) => setForm({ ...form, price_display: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-medium text-neutral-600">Estado</span>
          <select className="input-field mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {REALTOR_LISTING_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Dirección</span>
          <input className="input-field mt-1" value={form.address_display} onChange={(e) => setForm({ ...form, address_display: e.target.value })} />
        </label>
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Resumen</span>
          <textarea className="input-field mt-1 min-h-[60px]" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-medium text-neutral-600">Camas</span>
          <input type="number" step="0.5" className="input-field mt-1" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-medium text-neutral-600">Baños</span>
          <input type="number" step="0.5" className="input-field mt-1" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-medium text-neutral-600">Sq ft</span>
          <input type="number" className="input-field mt-1" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-medium text-neutral-600">Orden</span>
          <input type="number" className="input-field mt-1" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        </label>
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">URL listing</span>
          <input className="input-field mt-1" value={form.listing_url} onChange={(e) => setForm({ ...form, listing_url: e.target.value })} />
        </label>

        <div className="md:col-span-2 rounded-xl border border-greige-light bg-cream/40 p-4 space-y-4">
          <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Fotos (subir desde equipo)</p>
          <div>
            <span className="text-xs font-medium text-neutral-600 block mb-2">Portada</span>
            <div className="flex flex-wrap items-center gap-3">
              {form.cover_image_url && (
                <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-greige-light">
                  <img src={form.cover_image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 p-0.5 rounded bg-black/50 text-white"
                    onClick={() => setForm((f) => ({ ...f, cover_image_url: '' }))}
                    aria-label="Quitar portada"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <label className={`btn-outline btn-sm gap-2 cursor-pointer ${uploadingCover ? 'opacity-60 pointer-events-none' : ''}`}>
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
                Subir portada
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={handleCoverFile} />
              </label>
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-600 block mb-2">Galería</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.gallery_urls.map((url) => (
                <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-greige-light group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white"
                    onClick={() => removeGalleryUrl(url)}
                    aria-label="Quitar de galería"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className={`btn-outline btn-sm gap-2 cursor-pointer ${uploadingGallery ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
              Añadir fotos
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple className="hidden" onChange={handleGalleryFiles} />
            </label>
          </div>
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn-primary btn-sm gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </button>
    </form>
  )
}
