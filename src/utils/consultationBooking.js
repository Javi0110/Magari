import { supabase } from './supabase'

const TZ = 'America/Chicago'

export function formatInChicago(isoString, opts = {}) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    timeZone: TZ,
    weekday: opts.weekday ?? 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...opts,
  })
}

export function formatTimeRange(slot) {
  if (!slot?.start_time || !slot?.end_time) return '—'
  const s = new Date(slot.start_time)
  const e = new Date(slot.end_time)
  const date = s.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'short', day: 'numeric' })
  const t1 = s.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
  const t2 = e.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
  return `${date} · ${t1} – ${t2}`
}

export async function fetchAdminSettings() {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.from('admin_settings').select('*').limit(1).maybeSingle()
}

export async function fetchPublicAvailableSlots() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }
  const nowIso = new Date().toISOString()
  const res = await supabase
    .from('availability_slots')
    .select('id, start_time, end_time, is_available')
    .eq('is_available', true)
    .gte('end_time', nowIso)
    .order('start_time', { ascending: true })
  return res
}

export async function submitConsultationRequest(payload) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.rpc('create_consultation_request', {
    p_slot_id: payload.slotId,
    p_full_name: payload.fullName,
    p_email: payload.email,
    p_phone: payload.phone || '',
    p_service_type: payload.serviceType,
    p_message: payload.message || '',
  })
}

export async function updateConsultationRequest(id, patch) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.from('consultation_requests').update(patch).eq('id', id).select().single()
}

export async function fetchAllSlotsForAdmin() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }
  return supabase.from('availability_slots').select('*').order('start_time', { ascending: true })
}

export async function insertAvailabilitySlots(rows) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.from('availability_slots').insert(rows).select()
}

export async function deleteAvailabilitySlot(id) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.from('availability_slots').delete().eq('id', id)
}

export async function toggleSlotAvailability(id, isAvailable) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.from('availability_slots').update({ is_available: isAvailable }).eq('id', id).select().single()
}

export async function updateAdminSettingsRow(id, patch) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return supabase.from('admin_settings').update(patch).eq('id', id).select().single()
}

/** Group slots by calendar day in Chicago for UI */
export function groupSlotsByChicagoDay(slots) {
  const map = new Map()
  for (const slot of slots || []) {
    const d = new Date(slot.start_time)
    const key = d.toLocaleDateString('en-CA', { timeZone: TZ })
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(slot)
  }
  const keys = [...map.keys()].sort()
  return keys.map((k) => {
    const daySlots = map.get(k)
    const label = formatInChicago(daySlots[0].start_time, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    return { dateKey: k, label, slots: daySlots }
  })
}
