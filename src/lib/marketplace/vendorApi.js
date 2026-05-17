import { supabase } from '../../utils/supabase'
import { getVendorSecret } from './vendorSession'

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function verifyVendorLogin(email, secret) {
  const client = requireClient()
  const { data, error } = await client.rpc('verify_vendor_login', {
    p_email: String(email || '').trim(),
    p_secret: String(secret || '').trim(),
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return row || null
}

export async function vendorGetProfile(vendorId, secret = getVendorSecret()) {
  const client = requireClient()
  const { data, error } = await client.rpc('vendor_get_profile', {
    p_vendor_id: vendorId,
    p_secret: secret,
  })
  if (error) throw error
  return data || {}
}

export async function vendorUpdateProfile(vendorId, patch, secret = getVendorSecret()) {
  const client = requireClient()
  const { error } = await client.rpc('vendor_update_profile', {
    p_vendor_id: vendorId,
    p_secret: secret,
    p_patch: patch,
  })
  if (error) throw error
}

export async function vendorSetPassword(vendorId, currentSecret, newPassword) {
  const client = requireClient()
  const { error } = await client.rpc('vendor_set_password', {
    p_vendor_id: vendorId,
    p_current_secret: currentSecret,
    p_new_password: newPassword,
  })
  if (error) throw error
}

export async function vendorUpsertProduct(vendorId, productRow, productId = null, secret = getVendorSecret()) {
  const client = requireClient()
  const { data, error } = await client.rpc('vendor_upsert_product', {
    p_vendor_id: vendorId,
    p_secret: secret,
    p_product: productRow,
    p_product_id: productId,
  })
  if (error) throw error
  return data
}

export async function vendorDeleteProduct(vendorId, productId, secret = getVendorSecret()) {
  const client = requireClient()
  const { error } = await client.rpc('vendor_delete_product', {
    p_vendor_id: vendorId,
    p_secret: secret,
    p_product_id: productId,
  })
  if (error) throw error
}

export async function vendorListOrderItems(vendorId, secret = getVendorSecret()) {
  const client = requireClient()
  const { data, error } = await client.rpc('vendor_list_order_items', {
    p_vendor_id: vendorId,
    p_secret: secret,
  })
  if (error) throw error
  return data || []
}

export async function vendorListPayouts(vendorId, secret = getVendorSecret()) {
  const client = requireClient()
  const { data, error } = await client.rpc('vendor_list_payouts', {
    p_vendor_id: vendorId,
    p_secret: secret,
  })
  if (error) throw error
  return data || []
}
