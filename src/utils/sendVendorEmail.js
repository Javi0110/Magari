/**
 * Email de aprobación/rechazo al vendor: primero Edge Function Supabase; si falla, relay Netlify + Resend.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

import { sendVendorApprovalEmail, sendVendorRejectionEmail } from './emailRelay'

async function sendViaEdgeFunction(payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { success: false, error: 'Supabase not configured' }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-vendor-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { success: false, error: data.error || res.statusText }
  return { success: true }
}

export async function sendApprovalEmailToVendor({ email, name, businessName, accessCode, loginUrl }) {
  const payload = { type: 'approval', email, name, businessName, accessCode, loginUrl }
  const r = await sendViaEdgeFunction(payload)
  if (r.success) return r
  return sendVendorApprovalEmail({ email, name, businessName, accessCode, loginUrl })
}

export async function sendRejectionEmailToVendor({ email, name, businessName }) {
  const payload = { type: 'rejection', email, name, businessName }
  const r = await sendViaEdgeFunction(payload)
  if (r.success) return r
  return sendVendorRejectionEmail({ email, name, businessName })
}
