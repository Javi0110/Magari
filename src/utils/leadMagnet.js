import { supabase } from './supabase'
import { sendLeadMagnetChecklistEmail } from './emailService'

/**
 * Lead magnet legacy ("5 design secrets") — guarda en Supabase si existe y envía vía relay Resend.
 */
export async function submitLeadMagnet({ name, email }) {
  const trimmedEmail = (email || '').trim()
  const trimmedName = (name || '').trim()
  if (!trimmedEmail) {
    throw new Error('Email is required')
  }

  try {
    if (supabase) {
      await supabase.from('lead_magnet_signups').insert({
        email: trimmedEmail,
        name: trimmedName || null,
        source: '5-design-secrets',
      })
    }
  } catch (err) {
    console.error('Error saving lead magnet signup:', err)
  }

  const r = await sendLeadMagnetChecklistEmail({
    name: trimmedName || 'Friend',
    email: trimmedEmail,
    phone: '',
    serviceInterest: '',
    source: '5-design-secrets (legacy)',
  })
  if (!r.success) {
    throw new Error(r.error || 'Could not send email')
  }
  return { ok: true }
}
