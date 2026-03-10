import { supabase } from './supabase'

/**
 * Crea un pedido, sus líneas y las notificaciones para admin y vendors.
 * items: array de { id, title, price, quantity, vendorId? }
 * total: número
 */
export async function createOrderAndNotifications({ items, total, customerName, customerEmail, shippingAddress = '' }) {
  if (!supabase) throw new Error('Supabase no configurado')

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      total: Number(total),
      status: 'pending'
    })
    .select('id')
    .single()

  if (orderErr || !order) throw new Error(orderErr?.message || 'Error al crear el pedido')

  const orderId = order.id
  const vendorIds = new Set()

  for (const item of items) {
    const vendorId = item.vendorId ?? item.vendor_id ?? null
    if (vendorId) vendorIds.add(vendorId)
    await supabase.from('order_items').insert({
      order_id: orderId,
      product_id: item.id || null,
      product_title: item.title || 'Product',
      quantity: item.quantity || 1,
      price: Number(item.price || 0),
      vendor_id: vendorId
    })
  }

  await supabase.from('notifications').insert({
    recipient_type: 'admin',
    recipient_id: null,
    type: 'order',
    title: 'Nueva compra en el shop',
    body: `${customerName} realizó un pedido por $${Number(total).toFixed(2)}.`,
    payload: { order_id: orderId, customer_email: customerEmail }
  })

  for (const vid of vendorIds) {
    await supabase.from('notifications').insert({
      recipient_type: 'vendor',
      recipient_id: vid,
      type: 'order',
      title: 'Tienes una nueva venta',
      body: `Un cliente compró productos de tu tienda. Pedido #${orderId}.`,
      payload: { order_id: orderId }
    })
  }

  return { orderId }
}
