const { createClient } = require('@supabase/supabase-js')

const SERVICE_KEY_HINT =
  'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify → Site settings → Environment variables (Supabase → Project settings → API → service_role). Redeploy after saving.'

/**
 * @returns {{ supabaseUrl: string, serviceKey: string } | { error: string, hint: string }}
 */
function getServiceSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim()

  if (!supabaseUrl || !serviceKey) {
    return {
      error: 'Supabase server keys are not configured',
      hint: SERVICE_KEY_HINT,
    }
  }

  return { supabaseUrl, serviceKey }
}

/**
 * Service-role Supabase client for Netlify functions. Never falls back to anon key.
 * @returns {{ client: import('@supabase/supabase-js').SupabaseClient } | { error: string, hint?: string }}
 */
function createServiceSupabase() {
  const cfg = getServiceSupabaseConfig()
  if (cfg.error) return cfg
  return { client: createClient(cfg.supabaseUrl, cfg.serviceKey) }
}

module.exports = { createServiceSupabase, getServiceSupabaseConfig, SERVICE_KEY_HINT }
