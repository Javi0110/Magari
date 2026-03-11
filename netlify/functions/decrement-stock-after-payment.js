// After Stripe checkout success: fetch session and decrement shop_products stock
// Requires: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY in Netlify env

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
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
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase not configured for server' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const sessionId = (body.session_id || '').trim()
    if (!sessionId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) }
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    if (session.payment_status !== 'paid') {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Not paid yet' }) }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Only process once per session (avoid double decrement on refresh)
    const { error: insertErr } = await supabase
      .from('processed_checkout_sessions')
      .insert({ session_id: sessionId })
    if (insertErr) {
      // Already processed (unique violation)
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, already_processed: true }) }
    }

    const lineItems = session.line_items?.data || []

    for (const item of lineItems) {
      const productId = item.price?.product_data?.metadata?.product_id
      if (!productId) continue
      const id = parseInt(productId, 10)
      if (!Number.isInteger(id) || id <= 0) continue
      const qty = Math.max(0, item.quantity || 1)
      await supabase.rpc('decrement_shop_product_stock', { p_id: id, p_qty: qty })
    }

    // Basic Magari Rewards: 1 point per $1 spent on paid orders
    try {
      const email = (session.customer_details?.email || '').toLowerCase()
      if (email) {
        const total = Number(session.amount_total || 0) / 100
        const points = Math.floor(total)
        if (points > 0) {
          const referralCode = `MG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          const { data: rewardsUser, error: userErr } = await supabase
            .from('rewards_users')
            .upsert(
              { email, referral_code: referralCode },
              { onConflict: 'email' }
            )
            .select('*')
            .single()
          if (!userErr && rewardsUser) {
            await supabase.from('rewards_point_ledger').insert({
              user_id: rewardsUser.id,
              type: 'purchase',
              points,
              note: `Stripe session ${sessionId}`,
            })
            await supabase
              .from('rewards_users')
              .update({ points: (rewardsUser.points || 0) + points })
              .eq('id', rewardsUser.id)
          }
        }
      }
    } catch (rewardsErr) {
      console.error('Error updating rewards points:', rewardsErr)
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('decrement-stock-after-payment error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Server error' }),
    }
  }
}
