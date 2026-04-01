// Netlify Function: create Stripe Checkout Session
// Requires: npm install stripe
// En Netlify: Environment variables → STRIPE_SECRET_KEY (sk_test_... o sk_live_...)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '')
const { createClient } = require('@supabase/supabase-js')
const { checkDeliveryWithinRadius } = require('./deliveryRadiusUtils')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Magari & Co. <hello@casamagari.com>'

async function sendOrderEmail({ customerEmail, customerName, items, fulfillmentMethod = 'shipping', fulfillmentAmount = 0 }) {
  if (!RESEND_API_KEY) {
    console.warn('Missing RESEND_API_KEY, skipping order confirmation email')
    return
  }
  try {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    )
    const total = subtotal + Number(fulfillmentAmount)

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
        <p style="margin-top:12px;">Subtotal: $${subtotal.toFixed(2)}${fulfillmentAmount > 0 ? ` · ${fulfillmentMethod === 'delivery' ? 'Delivery' : 'Shipping'}: $${Number(fulfillmentAmount).toFixed(2)}` : ''}</p>
        ${fulfillmentMethod === 'local_pickup' ? `<p style="margin-top:6px;">Pickup: 75 Jan Ln, Georgetown, TX. We&apos;ll confirm full details after payment.</p>` : ''}
        <p style="margin-top:6px;"><strong>Total:</strong> $${total.toFixed(2)}</p>
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
    const fulfillmentMethod = body.fulfillmentMethod || 'shipping'
    const fulfillmentAmount = Math.max(0, Number(body.fulfillmentAmount) || 0)
    const shippingAddress = body.shippingAddress || {}
    const rewardCode = (body.rewardCode || '').trim()

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
          error: 'Please enter a valid email address (e.g. you@email.com).',
        }),
      }
    }

    if (fulfillmentMethod === 'delivery') {
      const deliveryCheck = await checkDeliveryWithinRadius({
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
      })
      if (!deliveryCheck.ok) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: deliveryCheck.error || 'Delivery is not available to this address.',
          }),
        }
      }
    }

    const line_items = items.map((item) => {
      const unitAmount = Math.round((item.price || 0) * 100)
      if (unitAmount < 50) {
        throw new Error('Minimum amount per item is $0.50 USD.')
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

    if (fulfillmentAmount > 0) {
      const isDelivery = fulfillmentMethod === 'delivery'
      line_items.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(fulfillmentAmount * 100),
          product_data: {
            name: isDelivery ? 'Delivery' : 'Shipping',
            description: isDelivery ? 'Flat rate $10 (within 30 miles)' : 'Flat rate $8 + $2 per additional item',
            metadata: { product_id: '', vendor_id: '' },
          },
        },
      })
    }

    const baseUrl = process.env.URL || 'https://casamagari.com'

    const metadata = {
      customer_name: customerName,
      source: 'casamagari-cart',
      fulfillment_method: fulfillmentMethod,
    }
    if (fulfillmentMethod === 'local_pickup') {
      metadata.pickup_address = '75 Jan Ln, Georgetown, TX'
    } else {
      metadata.shipping_line1 = (shippingAddress.line1 || '').slice(0, 500)
      metadata.shipping_city = (shippingAddress.city || '').slice(0, 500)
      metadata.shipping_state = (shippingAddress.state || '').slice(0, 500)
      metadata.shipping_postal_code = (shippingAddress.postal_code || '').slice(0, 500)
    }

    // Optional rewards coupon
    let discounts = []
    if (rewardCode) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_ANON_KEY

      if (!supabaseUrl || !serviceKey) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Rewards server configuration missing.' }),
        }
      }

      const supabase = createClient(supabaseUrl, serviceKey)
      const { data: couponRow, error: couponErr } = await supabase
        .from('rewards_coupons')
        .select('*')
        .eq('code', rewardCode)
        .eq('status', 'active')
        .lt('uses', 'max_uses')
        .maybeSingle()

      if (couponErr || !couponRow) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired rewards code.' }),
        }
      }

      const amountOff = Math.round(Number(couponRow.discount_amount || 0) * 100)
      if (amountOff > 0) {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: amountOff,
          currency: 'usd',
          duration: 'once',
        })
        discounts = [{ coupon: stripeCoupon.id }]

        const newUses = (couponRow.uses || 0) + 1
        await supabase
          .from('rewards_coupons')
          .update({
            uses: newUses,
            status: newUses >= (couponRow.max_uses || 1) ? 'used' : 'active',
          })
          .eq('id', couponRow.id)
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      discounts,
      customer_email: customerEmail,
      metadata,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    })

    sendOrderEmail({ customerEmail, customerName, items, fulfillmentMethod, fulfillmentAmount }).catch(() => {})

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

