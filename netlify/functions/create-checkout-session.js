// Netlify Function: create Stripe Checkout Session
// Requires: npm install stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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
    const items = Array.isArray(body.items) ? body.items : []
    const customerEmail = (body.customerEmail || '').trim()
    const customerName = (body.customerName || '').trim()

    if (!customerEmail || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email or items' }),
      }
    }

    const line_items = items.map((item) => ({
      quantity: item.quantity || 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round((item.price || 0) * 100),
        product_data: {
          name: item.title || 'Product',
          metadata: {
            product_id: String(item.id || ''),
            vendor_id: item.vendorId ? String(item.vendorId) : '',
          },
        },
      },
    }))

    const baseUrl = process.env.URL || 'https://casamagari.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: customerEmail,
      metadata: {
        customer_name: customerName,
        source: 'casamagari-cart',
      },
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error('Error creating checkout session:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Failed to create checkout session' }),
    }
  }
}

