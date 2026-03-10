const CHECKOUT_FUNCTION_URL = '/.netlify/functions/create-checkout-session'

/**
 * Create a Stripe Checkout session for a design service deposit
 */
export async function createServiceDepositCheckout({ service, reference, amount, customer }) {
  const price = Number(amount || 0)
  const email = (customer?.email || '').trim()
  const name = (customer?.fullName || customer?.name || '').trim()

  if (!price || !email) {
    throw new Error('Missing deposit amount or customer email for checkout')
  }

  const body = {
    items: [
      {
        id: reference || service || 'service-deposit',
        title: `${service || 'Design Service'} – Deposit`,
        price,
        quantity: 1,
      },
    ],
    customerEmail: email,
    customerName: name,
  }

  const res = await fetch(CHECKOUT_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Could not create checkout session for deposit')
  }

  return data.url
}

