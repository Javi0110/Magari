import { supabase } from './supabase'
import { sendLeadMagnetChecklistEmail } from './emailService'

/**
 * Save checklist / lead-magnet signup to Supabase (best-effort) and send PDF link emails via Netlify + Resend.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function submitLeadMagnetSignup({
  name,
  email,
  phone = '',
  serviceInterest = '',
  source = 'lead-magnet',
}) {
  const trimmedEmail = (email || '').trim()
  const trimmedName = (name || '').trim()
  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' }
  }

  if (supabase) {
    const row = {
      email: trimmedEmail,
      name: trimmedName || null,
      phone: (phone || '').trim() || null,
      service_interest: (serviceInterest || '').trim() || null,
      source: (source || 'lead-magnet').trim() || 'lead-magnet',
    }
    const { error: dbError } = await supabase.from('lead_magnet_signups').insert(row)
    if (dbError) {
      console.error('[lead magnet] Supabase insert:', dbError.message, dbError)
    }
  }

  return sendLeadMagnetChecklistEmail({
    name: trimmedName || 'Friend',
    email: trimmedEmail,
    phone: (phone || '').trim(),
    serviceInterest: (serviceInterest || '').trim(),
    source: source || 'lead-magnet',
  })
}

/**
 * Legacy Austin page form ("5 design secrets" style) — same storage + email as checklist.
 */
export async function submitLeadMagnet({ name, email }) {
  const r = await submitLeadMagnetSignup({
    name,
    email,
    phone: '',
    serviceInterest: '',
    source: '5-design-secrets',
  })
  if (!r.success) {
    throw new Error(r.error || 'Could not send email')
  }
  return { ok: true }
}
