// Netlify Function: create Stripe Checkout Session
// Requires: npm install stripe
// En Netlify: Environment variables → STRIPE_SECRET_KEY (sk_test_... o sk_live_...)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Magari & Co. <hello@casamagari.com>'

async function sendOrderEmail({ customerEmail, customerName, items }) {
  if (!RESEND_API_KEY) {
    console.warn('Missing RESEND_API_KEY, skipping order confirmation email')
    return
  }
  try {
    const total = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    )

    const lines = items
      .map(
        (item) =>
          `• ${item.title || 'Product'} × ${item.quantity || 1} — $${(
            (item.price || 0) * (item.quantity || 1)
          ).toFixed(2)}`
      )
      .join('<br/>')

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p>Hi${customerName ? ` ${customerName}` : ''},</p>
        <p>Thank you for your order at <strong>Magari &amp; Co.</strong>.</p>
        <p>Here is a summary of the items in your cart:</p>
        <p style="margin-top:12px; line-height:1.6;">
          ${lines}
        </p>
        <p style="margin-top:12px;"><strong>Estimated total:</strong> $${total.toFixed(2)}</p>
        <p style="margin-top:24px; font-size:14px; color:#555;">
          Your payment will be processed securely via Stripe. If you close the window before completing payment,
          your order will not be charged.
        </p>
        <p style="margin-top:24px;">
          With care,<br/>
          Elena<br/>
          Magari &amp; Co.
        </p>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [customerEmail, 'magaribyelena@gmail.com'],
        subject: 'Your Magari & Co. order (checkout started)',
        html,
      }),
    }).catch((err) => {
      console.error('Error sending order email via Resend:', err)
    })
  } catch (err) {
    console.error('Error building/sending order email:', err)
  }
}

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
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Stripe is not configured. Add STRIPE_SECRET_KEY in Netlify → Site settings → Environment variables, then redeploy.',
        }),
      }
    }

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
    if (customerEmail.length < 5 || !customerEmail.includes('@') || !customerEmail.includes('.')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Por favor usa un correo electrónico válido (ej: tu@email.com).',
        }),
      }
    }

    const line_items = items.map((item) => {
      const unitAmount = Math.round((item.price || 0) * 100)
      if (unitAmount < 50) {
        throw new Error('El monto mínimo por artículo es $0.50 USD. Revisa el depósito del servicio.')
      }
      return {
        quantity: item.quantity || 1,
        price_data: {
          currency: 'usd',
          unit_amount: unitAmount,
          product_data: {
            name: item.title || 'Product',
            metadata: {
              product_id: String(item.id || ''),
              vendor_id: item.vendorId ? String(item.vendorId) : '',
            },
          },
        },
      }
    })

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
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    })

    // Fire-and-forget confirmation email (order intent)
    sendOrderEmail({ customerEmail, customerName, items }).catch(() => {})

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

