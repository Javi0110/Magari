// After Stripe checkout success: retrieve session, decrement stock once, emails, rewards.
// Requires: STRIPE_SECRET_KEY, Supabase envs (see processShopPaidSession.js)

const { processShopPaidSession } = require('./processShopPaidSession')

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

  try {
    const body = JSON.parse(event.body || '{}')
    const sessionId = (body.session_id || '').trim()
    if (!sessionId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required', clearCart: false }) }
    }

    const result = await processShopPaidSession(sessionId)
    const statusCode = result.httpStatus || (result.ok === false ? 500 : 200)

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        clearCart: !!result.clearCart,
        paid: !!result.paid,
        alreadyProcessed: !!result.alreadyProcessed,
        ok: result.ok !== false,
        error: result.error || null,
      }),
    }
  } catch (err) {
    console.error('decrement-stock-after-payment error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Server error', clearCart: false, ok: false }),
    }
  }
}
