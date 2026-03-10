import { supabase } from './supabase'

const LEAD_MAGNET_URL = '/.netlify/functions/send-lead-magnet'

export async function submitLeadMagnet({ name, email }) {
  const trimmedEmail = (email || '').trim()
  const trimmedName = (name || '').trim()
  if (!trimmedEmail) {
    throw new Error('Email is required')
  }

  // Save in Supabase if available
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

  // Trigger email delivery via Netlify function + Resend
  try {
    const res = await fetch(LEAD_MAGNET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmedEmail, name: trimmedName }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Could not send the guide by email')
    }
  } catch (err) {
    console.error('Error calling lead magnet function:', err)
    throw err
  }

  return { ok: true }
}

