import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, Plus, Trash2, Save, ExternalLink } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { REALTOR_LISTING_STATUS_OPTIONS } from '../../constants/realtorListings'
import { normalizeGalleryUrls } from '../../utils/realtorListings'

const emptyForm = () => ({
  headline: '',
  price_display: '',
  address_display: '',
  summary: '',
  beds: '',
  baths: '',
  sqft: '',
  listing_url: '',
  cover_image_url: '',
  gallery_text: '',
  status: 'draft',
  sort_order: 0,
})

function galleryTextFromRow(row) {
  const arr = normalizeGalleryUrls(row.gallery_urls)
  return arr.join('\n')
}

export default function ListingsAdminView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newRow, setNewRow] = useState(emptyForm)

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

  const parseGallery = (text) => {
    const lines = String(text || '')
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
    return lines
  }

  const numOrNull = (v) => {
    if (v === '' || v == null) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const payloadFromForm = (f) => ({
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
    cover_image_url: f.cover_image_url.trim(),
    gallery_urls: parseGallery(f.gallery_text),
    status: f.status,
    sort_order: Number(f.sort_order) || 0,
  })

  const createListing = async (e) => {
    e.preventDefault()
    if (!supabase) return
    const p = payloadFromForm(newRow)
    if (!p.headline) {
      alert('Añade al menos un título (headline).')
      return
    }
    setCreating(true)
    const { data, error: insErr } = await supabase.from('realtor_listings').insert(p).select('*').single()
    setCreating(false)
    if (insErr) {
      alert(insErr.message || 'Error al crear')
      return
    }
    setRows((prev) => [data, ...prev])
    setNewRow(emptyForm())
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
          Solo los marcados <strong>Active</strong> aparecen en la página Real Estate. Pega URLs de fotos (portal/MLS o
          imágenes alojadas donde permita tu licencia).
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
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">Imagen principal (URL)</span>
            <input
              className="input-field mt-1"
              value={newRow.cover_image_url}
              onChange={(e) => setNewRow({ ...newRow, cover_image_url: e.target.value })}
              placeholder="https://…jpg"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">Galería — una URL por línea (opcional)</span>
            <textarea
              className="input-field mt-1 min-h-[64px] font-mono text-xs"
              value={newRow.gallery_text}
              onChange={(e) => setNewRow({ ...newRow, gallery_text: e.target.value })}
            />
          </label>
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
    gallery_text: galleryTextFromRow(row),
    status: row.status || 'draft',
    sort_order: row.sort_order ?? 0,
  }))

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
      gallery_text: galleryTextFromRow(row),
      status: row.status || 'draft',
      sort_order: row.sort_order ?? 0,
    })
  }, [row])

  const submit = (e) => {
    e.preventDefault()
    const lines = String(form.gallery_text || '')
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
    const numOrNull = (v) => {
      if (v === '' || v == null) return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    onSave({
      headline: form.headline.trim(),
      price_display: form.price_display.trim(),
      address_display: form.address_display.trim(),
      summary: form.summary.trim(),
      beds: numOrNull(form.beds),
      baths: numOrNull(form.baths),
      sqft: (() => {
        const s = numOrNull(form.sqft)
        return s != null ? Math.round(s) : null
      })(),
      listing_url: form.listing_url.trim(),
      cover_image_url: form.cover_image_url.trim(),
      gallery_urls: lines,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
    })
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
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Imagen portada (URL)</span>
          <input className="input-field mt-1" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
        </label>
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Galería (una URL por línea)</span>
          <textarea className="input-field mt-1 min-h-[56px] font-mono text-xs" value={form.gallery_text} onChange={(e) => setForm({ ...form, gallery_text: e.target.value })} />
        </label>
      </div>
      <button type="submit" disabled={saving} className="btn-primary btn-sm gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </button>
    </form>
  )
}
