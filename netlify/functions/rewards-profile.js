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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase server keys are not configured' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const email = (body.email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) }
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Upsert rewards user with stable referral code
    const referralCode = `MG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const { data: userRow, error: userErr } = await supabase
      .from('rewards_users')
      .upsert(
        { email, referral_code: referralCode },
        { onConflict: 'email' }
      )
      .select('*')
      .single()
    if (userErr) {
      console.error('rewards-profile upsert error:', userErr)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Could not load rewards profile' }),
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Could not load rewards data' }),
      }
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

