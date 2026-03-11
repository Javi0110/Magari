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
    process.env.SUPABASE_SECRET_KEY ||
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
    const reward = String(body.reward || '').trim() // '100' | '200' | '400'

    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) }
    }

    const mapping = {
      '100': { cost: 100, amount: 5 },
      '200': { cost: 200, amount: 10 },
      '400': { cost: 400, amount: 25 },
    }
    const config = mapping[reward]
    if (!config) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid reward option' }) }
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: user, error: userErr } = await supabase
      .from('rewards_users')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    if (userErr || !user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Rewards profile not found for this email yet.' }),
      }
    }

    const currentPoints = Number(user.points || 0)
    if (currentPoints < config.cost) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `You need at least ${config.cost} points to redeem this reward.` }),
      }
    }

    const newPoints = currentPoints - config.cost

    const code = `MG-${config.amount}OFF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const { data: coupon, error: couponErr } = await supabase
      .from('rewards_coupons')
      .insert({
        user_id: user.id,
        code,
        discount_amount: config.amount,
        points_spent: config.cost,
        max_uses: 1,
        status: 'active',
      })
      .select('*')
      .single()
    if (couponErr) {
      console.error('rewards-redeem coupon error:', couponErr)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Could not create reward coupon' }),
      }
    }

    const { error: ledgerErr } = await supabase.from('rewards_point_ledger').insert({
      user_id: user.id,
      type: 'redeem',
      points: -config.cost,
      note: `Redeemed for $${config.amount} coupon ${code}`,
    })
    if (ledgerErr) {
      console.error('rewards-redeem ledger error:', ledgerErr)
    }

    const { error: updateErr } = await supabase
      .from('rewards_users')
      .update({ points: newPoints })
      .eq('id', user.id)
    if (updateErr) {
      console.error('rewards-redeem update user error:', updateErr)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ coupon }),
    }
  } catch (err) {
    console.error('rewards-redeem error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Unexpected server error' }),
    }
  }
}

