/**
 * Shared logic: Stripe Checkout session paid → idempotent stock + rewards + Resend emails.
 * Used by decrement-stock-after-payment (browser return) and stripe-webhook (reliable).
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '')
const { createServiceSupabase } = require('./shared/supabaseServer')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Magari & Co. <hello@casamagari.com>'
const MAGARI_ORDER_EMAIL = 'magaribyelena@gmail.com'

function isUniqueViolation(err) {
  if (!err) return false
  if (err.code === '23505') return true
  const m = String(err.message || '').toLowerCase()
  return m.includes('duplicate') || m.includes('unique constraint')
}

/** Stripe Checkout can expose email in a few places depending on timing / API version. */
function extractSessionEmail(session) {
  const raw =
    session.customer_details?.email ||
    session.customer_email ||
    session.customer_details?.email_address ||
    ''
  const e = String(raw || '').trim().toLowerCase()
  return e.includes('@') ? e : ''
}

/** Stripe retrieve expands price.product — metadata lives on Product, not price.product_data */
function lineItemProductId(line) {
  const price = line.price
  if (!price || typeof price === 'string') return null
  const product = price.product
  if (typeof product === 'object' && product?.metadata?.product_id) {
    const n = parseInt(String(product.metadata.product_id), 10)
    if (Number.isInteger(n) && n > 0) return n
  }
  if (price.metadata && price.metadata.product_id) {
    const n = parseInt(String(price.metadata.product_id), 10)
    if (Number.isInteger(n) && n > 0) return n
  }
  return null
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function sendPaidOrderEmails(session, lineItems) {
  if (!RESEND_API_KEY) {
    console.warn('[processShopPaidSession] RESEND_API_KEY missing; skip order emails')
    return
  }
  const customerEmail = extractSessionEmail(session)
  if (!customerEmail) {
    console.warn('[processShopPaidSession] No customer email on session')
    return
  }

  const name = (session.metadata?.customer_name || '').trim()
  const total = Number(session.amount_total || 0) / 100
  const lines = (lineItems || [])
    .map((line) => {
      const qty = line.quantity || 1
      const desc = line.description || line.price?.product?.name || 'Item'
      const amount = line.amount_total != null ? Number(line.amount_total) / 100 : null
      const priceStr = amount != null ? ` — $${amount.toFixed(2)}` : ''
      return `• ${escHtml(desc)} × ${qty}${priceStr}`
    })
    .join('<br/>')

  const htmlCustomer = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #222;">
        <p>Hi${name ? ` ${escHtml(name)}` : ''},</p>
        <p><strong>Your payment was received.</strong> Thank you for shopping with Magari &amp; Co.</p>
        <p style="margin-top:12px; line-height:1.6;">${lines}</p>
        <p style="margin-top:12px;"><strong>Total paid:</strong> $${total.toFixed(2)}</p>
        <p style="margin-top:16px; font-size:14px; color:#555;">Reference: ${escHtml(session.id)}</p>
        <p style="margin-top:24px;">With care,<br/>Magari &amp; Co.</p>
      </div>`

  const htmlAdmin = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #222;">
        <p><strong>New paid order</strong></p>
        <p>Customer: ${escHtml(customerEmail)}${name ? ` (${escHtml(name)})` : ''}</p>
        <p>Total: $${total.toFixed(2)}</p>
        <p style="margin-top:12px; line-height:1.6;">${lines}</p>
        <p style="margin-top:12px; font-size:13px; color:#555;">Stripe session: ${escHtml(session.id)}</p>
      </div>`

  const payloads = [
    {
      to: [customerEmail],
      subject: 'We received your order — Magari & Co.',
      html: htmlCustomer,
    },
    {
      to: [MAGARI_ORDER_EMAIL],
      subject: `New order paid — ${customerEmail} — $${total.toFixed(2)}`,
      html: htmlAdmin,
    },
  ]

  for (const p of payloads) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, ...p }),
    })
    if (!res.ok) {
      const t = await res.text()
      console.error('[processShopPaidSession] Resend error', res.status, t)
    }
  }
}

const PURCHASE_NOTE_PREFIX = 'Stripe session '

/**
 * Idempotent: one ledger "purchase" row per Stripe session (retries / webhook + success page).
 * Does NOT overwrite rewards_users.referral_code (avoid destructive upsert on every checkout).
 */
async function getOrCreateRewardsUser(supabase, email) {
  const { data: existing, error: selErr } = await supabase.from('rewards_users').select('*').eq('email', email).maybeSingle()
  if (selErr) {
    console.error('[processShopPaidSession] rewards_users select', selErr)
    return null
  }
  if (existing) return existing

  const referralCode = `MG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const { data: inserted, error: insErr } = await supabase
    .from('rewards_users')
    .insert({ email, referral_code: referralCode })
    .select('*')
    .single()
  if (!insErr && inserted) return inserted

  if (isUniqueViolation(insErr)) {
    const { data: again } = await supabase.from('rewards_users').select('*').eq('email', email).maybeSingle()
    return again || null
  }
  console.error('[processShopPaidSession] rewards_users insert', insErr)
  return null
}

/**
 * Persist one shop_orders row per paid Stripe session (Rewards "Your orders").
 * Uses select + insert/update so we are not dependent on PostgREST upsert + partial unique indexes.
 * Allows total 0 (e.g. 100% rewards discount) so the order still appears in the dashboard.
 */
async function upsertShopOrderFromStripe(sessionId, session, supabase) {
  const email = extractSessionEmail(session)
  if (!email) {
    console.warn('[processShopPaidSession] shop_orders: no customer email on session', sessionId)
    return null
  }
  const name = (session.metadata?.customer_name || '').trim() || null
  const total = Number(session.amount_total || 0) / 100
  if (!Number.isFinite(total) || total < 0) {
    console.warn('[processShopPaidSession] shop_orders: invalid amount_total', sessionId, session.amount_total)
    return null
  }

  const row = {
    stripe_checkout_session_id: sessionId,
    customer_email: email,
    customer_name: name,
    total: Math.max(0, total),
    status: 'paid',
  }

  const { data: existing, error: selErr } = await supabase
    .from('shop_orders')
    .select('id')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()
  if (selErr) {
    console.error('[processShopPaidSession] shop_orders select', selErr)
  }

  if (existing?.id) {
    const { data: updated, error: updErr } = await supabase
      .from('shop_orders')
      .update({
        customer_email: row.customer_email,
        customer_name: row.customer_name,
        total: row.total,
        status: 'paid',
      })
      .eq('id', existing.id)
      .select('id')
      .maybeSingle()
    if (updErr) {
      console.error('[processShopPaidSession] shop_orders update', updErr)
      return existing.id
    }
    return updated?.id ?? existing.id
  }

  const { data: inserted, error: insErr } = await supabase.from('shop_orders').insert(row).select('id').maybeSingle()
  if (insErr) {
    if (isUniqueViolation(insErr)) {
      const { data: again } = await supabase
        .from('shop_orders')
        .select('id')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle()
      return again?.id ?? null
    }
    console.error('[processShopPaidSession] shop_orders insert', insErr)
    return null
  }
  return inserted?.id ?? null
}

async function ensurePurchaseRewardsAndOrder(sessionId, session, supabase) {
  try {
    const email = extractSessionEmail(session)
    if (!email) {
      console.warn('[processShopPaidSession] no email on paid session; skip shop_orders + rewards', sessionId)
      return
    }

    // Always sync shop_orders first so "Your orders" works even when purchase points are 0 or ledger already exists.
    const orderId = await upsertShopOrderFromStripe(sessionId, session, supabase)

    const note = `${PURCHASE_NOTE_PREFIX}${sessionId}`
    const { data: existingLedger, error: ledSelErr } = await supabase
      .from('rewards_point_ledger')
      .select('id')
      .eq('type', 'purchase')
      .eq('note', note)
      .maybeSingle()
    if (ledSelErr) {
      console.error('[processShopPaidSession] ledger idempotency select', ledSelErr)
    }
    if (existingLedger?.id) {
      return
    }

    const total = Number(session.amount_total || 0) / 100
    let points = Math.floor(total)
    if (!Number.isFinite(points) || points <= 0 || total <= 0 || total > 10000) {
      points = 0
    }
    const MAX_POINTS_PER_ORDER = 500
    points = Math.min(points, MAX_POINTS_PER_ORDER)

    if (points <= 0) return

    const rewardsUser = await getOrCreateRewardsUser(supabase, email)
    if (!rewardsUser) return

    const { error: ledgerErr } = await supabase.from('rewards_point_ledger').insert({
      user_id: rewardsUser.id,
      type: 'purchase',
      points,
      order_id: orderId,
      note,
    })
    if (ledgerErr) {
      if (isUniqueViolation(ledgerErr)) return
      console.error('[processShopPaidSession] rewards_point_ledger insert', ledgerErr)
      return
    }

    await supabase
      .from('rewards_users')
      .update({ points: (rewardsUser.points || 0) + points, updated_at: new Date().toISOString() })
      .eq('id', rewardsUser.id)
  } catch (rewardsErr) {
    console.error('[processShopPaidSession] ensurePurchaseRewardsAndOrder', rewardsErr)
  }
}

/**
 * @returns {Promise<{
 *   ok: boolean,
 *   clearCart: boolean,
 *   paid?: boolean,
 *   alreadyProcessed?: boolean,
 *   error?: string | null,
 *   httpStatus?: number
 * }>}
 */
async function processShopPaidSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return { ok: false, clearCart: false, error: 'session_id required', httpStatus: 400 }
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    return { ok: false, clearCart: false, error: 'Stripe not configured', httpStatus: 500 }
  }

  const sb = createServiceSupabase()
  if (sb.error) {
    return { ok: false, clearCart: false, error: sb.error, httpStatus: 500 }
  }
  const supabase = sb.client

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    })
  } catch (e) {
    console.error('[processShopPaidSession] Stripe retrieve failed', e)
    return { ok: false, clearCart: false, error: e.message || 'Stripe error', httpStatus: 500 }
  }

  if (session.payment_status !== 'paid') {
    return { ok: true, clearCart: false, paid: false, error: null }
  }

  // Rewards + shop_orders: safe to run on every retry (idempotent); fills dashboard even if stock step already ran.
  await ensurePurchaseRewardsAndOrder(sessionId, session, supabase)

  const { error: insertErr } = await supabase.from('processed_checkout_sessions').insert({ session_id: sessionId })

  if (insertErr) {
    if (isUniqueViolation(insertErr)) {
      return { ok: true, clearCart: true, paid: true, alreadyProcessed: true, error: null }
    }
    console.error('[processShopPaidSession] processed_checkout_sessions insert', insertErr)
    return { ok: false, clearCart: false, error: insertErr.message || 'Database error', httpStatus: 500 }
  }

  let lineItems = session.line_items?.data || []
  if (!lineItems.length) {
    try {
      const list = await stripe.checkout.sessions.listLineItems(sessionId, {
        limit: 100,
        expand: ['data.price.product'],
      })
      lineItems = list.data || []
    } catch (e) {
      console.error('[processShopPaidSession] listLineItems fallback', e)
    }
  }

  for (const item of lineItems) {
    const productId = lineItemProductId(item)
    if (!productId) continue
    const qty = Math.max(0, item.quantity || 1)
    const { error: rpcErr } = await supabase.rpc('decrement_shop_product_stock', {
      p_id: productId,
      p_qty: qty,
    })
    if (rpcErr) {
      console.error('[processShopPaidSession] decrement_shop_product_stock', rpcErr, productId, qty)
    }
  }

  try {
    await sendPaidOrderEmails(session, lineItems)
  } catch (mailErr) {
    console.error('[processShopPaidSession] sendPaidOrderEmails', mailErr)
  }

  return { ok: true, clearCart: true, paid: true, alreadyProcessed: false, error: null }
}

module.exports = { processShopPaidSession }
