const {
  checkDeliveryWithinRadius,
  validateAllDeliveryChecks,
  MAX_DELIVERY_MILES,
} = require('./deliveryRadiusUtils')

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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const address = body.address || {}
    const requireMagari = body.requireMagariDeliveryCheck === true
    const vendorChecks = Array.isArray(body.vendorDeliveryChecks) ? body.vendorDeliveryChecks : []

    let result
    if (requireMagari || vendorChecks.length > 0) {
      result = await validateAllDeliveryChecks(address, {
        requireMagari,
        vendorChecks,
      })
    } else {
      result = await checkDeliveryWithinRadius(address)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...result,
        maxMiles: MAX_DELIVERY_MILES,
      }),
    }
  } catch (err) {
    console.error('validate-delivery-radius:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, miles: null, error: 'Could not verify delivery area. Try again.' }),
    }
  }
}
