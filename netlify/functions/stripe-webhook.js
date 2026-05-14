/**
 * Stripe webhook — configure in Stripe Dashboard:
 * URL: https://YOUR_DOMAIN/.netlify/functions/stripe-webhook
 * Events: checkout.session.completed
 * Signing secret → STRIPE_WEBHOOK_SECRET in Netlify
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '')
const { processShopPaidSession } = require('./processShopPaidSession')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not set')
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook not configured' }) }
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret)
  } catch (err) {
    console.error('stripe-webhook: signature failed', err.message)
    return { statusCode: 400, body: JSON.stringify({ error: `Webhook signature: ${err.message}` }) }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    const source = session.metadata?.source || ''
    if (source === 'casamagari-cart') {
      const result = await processShopPaidSession(session.id)
      if (result.ok === false) {
        console.error('stripe-webhook: processShopPaidSession failed', result.error)
        return { statusCode: 500, body: JSON.stringify({ error: result.error || 'Processing failed' }) }
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
