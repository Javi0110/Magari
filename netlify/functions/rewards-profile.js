const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY || // fallback name if used
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceKey) {
    const hint =
      'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify → Site settings → Environment variables (get the service_role key in Supabase → Project settings → API). Redeploy.'
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Supabase server keys are not configured',
        hint,
      }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const email = (body.email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) }
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Get or create rewards user (keep existing referral_code)
    let userRow = null
    const { data: existing, error: selectErr } = await supabase
      .from('rewards_users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (selectErr) {
      console.error('rewards-profile select error:', selectErr)
      const msg = selectErr.code === '42P01'
        ? 'Rewards tables are missing. Run the rewards migrations in Supabase (SQL Editor): 20260129000000_rewards_schema.sql and 20260129020000_rewards_rls_lockdown.sql'
        : (selectErr.message || 'Could not load rewards profile.')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: msg }),
      }
    }

    if (existing) {
      userRow = existing
    } else {
      const referralCode = `MG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const { data: inserted, error: insertErr } = await supabase
        .from('rewards_users')
        .insert({ email, referral_code: referralCode })
        .select('*')
        .single()
      if (insertErr) {
        console.error('rewards-profile insert error:', insertErr)
        const msg = insertErr.code === '42P01' ? 'Rewards tables missing. Run the rewards migrations in Supabase SQL Editor.' : (insertErr.message || 'Could not create rewards profile.')
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: msg }),
        }
      }
      userRow = inserted

      // Award 50 signup bonus points for new account
      const SIGNUP_BONUS = 50
      const { error: ledgerErr } = await supabase
        .from('rewards_point_ledger')
        .insert({
          user_id: userRow.id,
          type: 'signup',
          points: SIGNUP_BONUS,
          note: 'Welcome bonus',
        })
      if (!ledgerErr) {
        await supabase
          .from('rewards_users')
          .update({ points: (userRow.points || 0) + SIGNUP_BONUS, updated_at: new Date().toISOString() })
          .eq('id', userRow.id)
        userRow = { ...userRow, points: (userRow.points || 0) + SIGNUP_BONUS }
      }
    }

    const [{ data: ledgerRows, error: ledgerErr }, { data: orderRows, error: ordersErr }, { data: couponRows, error: couponsErr }] =
      await Promise.all([
        supabase
          .from('rewards_point_ledger')
          .select('*')
          .eq('user_id', userRow.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('shop_orders')
          .select('*')
          .eq('customer_email', email)
          .order('created_at', { ascending: false }),
        supabase
          .from('rewards_coupons')
          .select('*')
          .eq('user_id', userRow.id)
          .order('created_at', { ascending: false }),
      ])

    if (ledgerErr || ordersErr || couponsErr) {
      console.error('rewards-profile load errors:', { ledgerErr, ordersErr, couponsErr })
      // Still return success with empty lists so the profile loads; frontend can show partial data
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: userRow,
        ledger: ledgerRows || [],
        orders: orderRows || [],
        coupons: couponRows || [],
      }),
    }
  } catch (err) {
    console.error('rewards-profile error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Unexpected server error' }),
    }
  }
}

