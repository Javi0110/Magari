import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Trash2, Plus, Calendar as CalIcon, ToggleLeft, ToggleRight, Layers } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import {
  fetchAllSlotsForAdmin,
  insertAvailabilitySlots,
  deleteAvailabilitySlot,
  toggleSlotAvailability,
  fetchAdminSettings,
  updateAdminSettingsRow,
  formatInChicago,
} from '../../utils/consultationBooking'

const WEEKDAYS = [
  { v: 1, l: 'Mon' },
  { v: 2, l: 'Tue' },
  { v: 3, l: 'Wed' },
  { v: 4, l: 'Thu' },
  { v: 5, l: 'Fri' },
  { v: 6, l: 'Sat' },
  { v: 0, l: 'Sun' },
]

function enumerateDays(fromYmd, toYmd) {
  const out = []
  const [y1, m1, d1] = fromYmd.split('-').map(Number)
  const [y2, m2, d2] = toYmd.split('-').map(Number)
  const cur = new Date(y1, m1 - 1, d1)
  const end = new Date(y2, m2 - 1, d2)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${d}`)
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

function buildSlotRows({ days, weekdays, startTime, endTime, intervalMinutes }) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const startM = sh * 60 + sm
  const endM = eh * 60 + em
  const rows = []
  for (const day of days) {
    const [y, mo, d] = day.split('-').map(Number)
    const dow = new Date(y, mo - 1, d).getDay()
    if (!weekdays.includes(dow)) continue
    for (let t = startM; t + intervalMinutes <= endM; t += intervalMinutes) {
      const h1 = Math.floor(t / 60)
      const m1 = t % 60
      const t2 = t + intervalMinutes
      const h2 = Math.floor(t2 / 60)
      const m2 = t2 % 60
      const start = new Date(y, mo - 1, d, h1, m1, 0, 0)
      const end = new Date(y, mo - 1, d, h2, m2, 0, 0)
      rows.push({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_available: true,
      })
    }
  }
  return rows
}

export default function AvailabilityAdminView() {
  const [slots, setSlots] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthCursor, setMonthCursor] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [singleStart, setSingleStart] = useState('')
  const [singleEnd, setSingleEnd] = useState('')
  const [bulkFrom, setBulkFrom] = useState('')
  const [bulkTo, setBulkTo] = useState('')
  const [bulkStart, setBulkStart] = useState('09:00')
  const [bulkEnd, setBulkEnd] = useState('13:00')
  const [bulkInterval, setBulkInterval] = useState(30)
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) {
      setError('Supabase no configurado.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const [{ data: sdata, error: e1 }, { data: st, error: e2 }] = await Promise.all([
      fetchAllSlotsForAdmin(),
      fetchAdminSettings(),
    ])
    if (e1) setError(e1.message || 'Error slots')
    if (e2 && !st) setError((prev) => prev || e2.message)
    setSlots(sdata || [])
    if (st) setSettings(st)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const slotsInMonth = useMemo(() => {
    const y = monthCursor.getFullYear()
    const m = monthCursor.getMonth()
    return (slots || []).filter((s) => {
      const d = new Date(s.start_time)
      return d.getFullYear() === y && d.getMonth() === m
    })
  }, [slots, monthCursor])

  const addSingle = async () => {
    if (!singleStart || !singleEnd) return
    setSaving(true)
    const { data, error: e } = await insertAvailabilitySlots([
      { start_time: new Date(singleStart).toISOString(), end_time: new Date(singleEnd).toISOString(), is_available: true },
    ])
    setSaving(false)
    if (e) {
      alert(e.message)
      return
    }
    setSlots((prev) => [...prev, ...(data || [])].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
    setSingleStart('')
    setSingleEnd('')
  }

  const addBulk = async () => {
    if (!bulkFrom || !bulkTo) {
      alert('Elige rango de fechas')
      return
    }
    const days = enumerateDays(bulkFrom, bulkTo)
    const rows = buildSlotRows({
      days,
      weekdays,
      startTime: bulkStart,
      endTime: bulkEnd,
      intervalMinutes: bulkInterval,
    })
    if (!rows.length) {
      alert('No se generaron franjas (revisa días de la semana y horas).')
      return
    }
    setSaving(true)
    const { error: e } = await insertAvailabilitySlots(rows)
    setSaving(false)
    if (e) {
      alert(e.message)
      return
    }
    await load()
  }

  const remove = async (id) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar este bloque?')) return
    const { error: e } = await deleteAvailabilitySlot(id)
    if (e) {
      alert(e.message)
      return
    }
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const toggle = async (s) => {
    const { data, error: e } = await toggleSlotAvailability(s.id, !s.is_available)
    if (e) {
      alert(e.message)
      return
    }
    setSlots((prev) => prev.map((x) => (x.id === s.id ? data : x)))
  }

  const saveSettings = async (patch) => {
    if (!settings?.id) return
    const { data, error: e } = await updateAdminSettingsRow(settings.id, patch)
    if (e) {
      alert(e.message)
      return
    }
    setSettings(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Cargando disponibilidad…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}

      {settings && (
        <div className="rounded-2xl border border-greige-light bg-white p-5 grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label text-xs">Buffer antes de cita (min)</label>
            <input
              type="number"
              min={0}
              className="input-field text-sm py-2"
              defaultValue={settings.booking_buffer_minutes}
              onBlur={(e) => saveSettings({ booking_buffer_minutes: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="form-label text-xs">Máx. reservas / día (referencia)</label>
            <input
              type="number"
              min={1}
              className="input-field text-sm py-2"
              defaultValue={settings.max_bookings_per_day}
              onBlur={(e) => saveSettings({ max_bookings_per_day: Number(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="form-label text-xs">Zona horaria</label>
            <input className="input-field text-sm py-2" readOnly value={settings.timezone} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-greige-light bg-white p-5 space-y-4"
        >
          <h3 className="font-serif text-xl text-neutral-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-sage" />
            Un bloque
          </h3>
          <p className="text-xs text-neutral-500">Inicio y fin en hora local del navegador (Central si estás en TX).</p>
          <div>
            <label className="form-label text-xs">Inicio</label>
            <input type="datetime-local" className="input-field text-sm py-2" value={singleStart} onChange={(e) => setSingleStart(e.target.value)} />
          </div>
          <div>
            <label className="form-label text-xs">Fin</label>
            <input type="datetime-local" className="input-field text-sm py-2" value={singleEnd} onChange={(e) => setSingleEnd(e.target.value)} />
          </div>
          <button type="button" disabled={saving} onClick={addSingle} className="btn-primary btn-sm">
            Añadir bloque
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-greige-light bg-white p-5 space-y-4"
        >
          <h3 className="font-serif text-xl text-neutral-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sage" />
            Crear en masa
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Desde</label>
              <input type="date" className="input-field text-sm py-2" value={bulkFrom} onChange={(e) => setBulkFrom(e.target.value)} />
            </div>
            <div>
              <label className="form-label text-xs">Hasta</label>
              <input type="date" className="input-field text-sm py-2" value={bulkTo} onChange={(e) => setBulkTo(e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label text-xs">Hora inicio</label>
              <input type="time" className="input-field text-sm py-2" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} />
            </div>
            <div>
              <label className="form-label text-xs">Hora fin</label>
              <input type="time" className="input-field text-sm py-2" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} />
            </div>
            <div>
              <label className="form-label text-xs">Intervalo (min)</label>
              <select className="input-field text-sm py-2" value={bulkInterval} onChange={(e) => setBulkInterval(Number(e.target.value))}>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>
          <div>
            <p className="form-label text-xs mb-2">Días</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((w) => (
                <label key={w.v} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weekdays.includes(w.v)}
                    onChange={(e) => {
                      if (e.target.checked) setWeekdays((p) => [...new Set([...p, w.v])].sort((a, b) => a - b))
                      else setWeekdays((p) => p.filter((x) => x !== w.v))
                    }}
                  />
                  {w.l}
                </label>
              ))}
            </div>
          </div>
          <button type="button" disabled={saving} onClick={addBulk} className="btn-primary btn-sm">
            Generar franjas
          </button>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-greige-light bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-serif text-xl text-neutral-800 flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-sage" />
            Calendario · {monthLabel}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            >
              ←
            </button>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            >
              →
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {slotsInMonth.length === 0 && <p className="text-sm text-neutral-500">No hay bloques este mes.</p>}
          {slotsInMonth.map((s) => (
            <div
              key={s.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                s.is_available ? 'border-sage-muted/50 bg-cream/40' : 'border-neutral-200 bg-neutral-50 opacity-80'
              }`}
            >
              <div>
                <p className="font-medium text-neutral-800">{formatInChicago(s.start_time)}</p>
                <p className="text-xs text-neutral-500">hasta {formatInChicago(s.end_time, { weekday: undefined })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-greige-light"
                  title={s.is_available ? 'Marcar no disponible' : 'Marcar disponible'}
                >
                  {s.is_available ? <ToggleRight className="w-5 h-5 text-sage" /> : <ToggleLeft className="w-5 h-5 text-neutral-400" />}
                </button>
                <button type="button" onClick={() => remove(s.id)} className="p-2 rounded-lg text-red-700 hover:bg-red-50" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
