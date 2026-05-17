const { createServiceSupabase, SERVICE_KEY_HINT } = require('./shared/supabaseServer')

const REVIEW_POINTS = 20

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

  const sb = createServiceSupabase()
  if (sb.error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: sb.error,
        hint: sb.hint || SERVICE_KEY_HINT,
      }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const reviewId = body.reviewId != null ? Number(body.reviewId) : null
    if (!reviewId || !Number.isInteger(reviewId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid reviewId required' }) }
    }

    const supabase = sb.client

    const { data: review, error: reviewErr } = await supabase
      .from('product_reviews')
      .select('id, email, status, rewards_awarded_at')
      .eq('id', reviewId)
      .single()

    if (reviewErr || !review) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Review not found' }) }
    }
    if (review.rewards_awarded_at) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Points already awarded' }) }
    }
    const email = (review.email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'No email on review' }) }
    }
    if (review.status !== 'approved') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Review must be approved first' }) }
    }

    // Get or create rewards user
    const { data: existing } = await supabase
      .from('rewards_users')
      .select('id, points')
      .eq('email', email)
      .maybeSingle()

    let userId
    if (existing) {
      userId = existing.id
    } else {
      const referralCode = `MG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const { data: inserted, error: insertErr } = await supabase
        .from('rewards_users')
        .insert({ email, referral_code: referralCode })
        .select('id')
        .single()
      if (insertErr) {
        console.error('rewards-award-review create user:', insertErr)
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not create rewards user' }) }
      }
      userId = inserted.id
    }

    await supabase.from('rewards_point_ledger').insert({
      user_id: userId,
      type: 'review',
      points: REVIEW_POINTS,
      note: `review:${reviewId}`,
    })

    const currentPoints = existing?.points ?? 0
    await supabase
      .from('rewards_users')
      .update({ points: currentPoints + REVIEW_POINTS, updated_at: new Date().toISOString() })
      .eq('id', userId)

    await supabase
      .from('product_reviews')
      .update({ rewards_awarded_at: new Date().toISOString() })
      .eq('id', reviewId)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, points: REVIEW_POINTS, email }),
    }
  } catch (err) {
    console.error('rewards-award-review error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Unexpected server error' }),
    }
  }
}
