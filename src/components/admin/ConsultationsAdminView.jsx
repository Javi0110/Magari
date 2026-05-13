import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw, Filter, ChevronDown, ChevronUp, Save, Phone } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import {
  updateConsultationRequest,
  formatTimeRange,
} from '../../utils/consultationBooking'
import { CONSULTATION_STATUS_OPTIONS, labelForServiceType } from '../../constants/consultationBooking'

export default function ConsultationsAdminView() {
  const [rows, setRows] = useState([])
  const [slotMap, setSlotMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [savingId, setSavingId] = useState(null)

  const load = useCallback(async () => {
    if (!supabase) {
      setError('Supabase no configurado.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data: reqs, error: e1 } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (e1) {
      setError(e1.message || 'No se pudieron cargar las solicitudes.')
      setRows([])
      setLoading(false)
      return
    }
    const list = reqs || []
    const ids = [...new Set(list.map((r) => r.requested_slot_id).filter(Boolean))]
    let sm = {}
    if (ids.length) {
      const { data: slots } = await supabase.from('availability_slots').select('*').in('id', ids)
      sm = Object.fromEntries((slots || []).map((s) => [s.id, s]))
    }
    setSlotMap(sm)
    setRows(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!statusFilter) return rows
    return rows.filter((r) => r.status === statusFilter)
  }, [rows, statusFilter])

  const saveRow = async (id, patch) => {
    setSavingId(id)
    const { data, error: e } = await updateConsultationRequest(id, patch)
    setSavingId(null)
    if (e) {
      alert(e.message || 'Error al guardar')
      return
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Cargando consultas…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      )}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            className="input-field max-w-xs text-sm py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {CONSULTATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={load} className="btn-outline btn-sm gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-neutral-500 text-sm">No hay solicitudes.</p>}
        {filtered.map((r) => {
          const slot = slotMap[r.requested_slot_id]
          const open = expandedId === r.id
          return (
            <motion.div
              key={r.id}
              layout
              className="rounded-2xl border border-greige-light bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : r.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-cream/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-800 truncate">{r.full_name}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {labelForServiceType(r.service_type)} · {r.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-sage-muted/30 text-sage-dark">
                    {r.status}
                  </span>
                  {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-greige-light/80 bg-cream/30 px-4 py-4 space-y-4"
                  >
                    <div className="text-sm text-neutral-700 space-y-1">
                      <p>
                        <span className="font-medium">Horario:</span> {slot ? formatTimeRange(slot) : '—'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        {r.phone || '—'}
                      </p>
                      {r.message && (
                        <p>
                          <span className="font-medium">Mensaje:</span> {r.message}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400">ID: {r.id}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="form-label text-xs">Estado</label>
                        <select
                          className="input-field text-sm py-2"
                          value={r.status}
                          onChange={(e) => saveRow(r.id, { status: e.target.value })}
                          disabled={savingId === r.id}
                        >
                          {CONSULTATION_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label text-xs">Último contacto</label>
                        <button
                          type="button"
                          className="btn-outline btn-sm w-full"
                          disabled={savingId === r.id}
                          onClick={() => saveRow(r.id, { last_contacted_at: new Date().toISOString(), status: 'contacted' })}
                        >
                          Marcar contactado ahora
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="form-label text-xs">Notas internas</label>
                      <textarea
                        className="input-field text-sm min-h-20"
                        defaultValue={r.notes || ''}
                        id={`notes-${r.id}`}
                        placeholder="Seguimiento, llamadas, etc."
                      />
                      <button
                        type="button"
                        className="btn-primary btn-sm mt-2 gap-2"
                        disabled={savingId === r.id}
                        onClick={() => {
                          const el = document.getElementById(`notes-${r.id}`)
                          saveRow(r.id, { notes: el?.value || '' })
                        }}
                      >
                        <Save className="w-4 h-4" />
                        Guardar notas
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
