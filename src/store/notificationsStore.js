import { create } from 'zustand'
import { supabase } from '../utils/supabase'

export const useNotificationsStore = create((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchForAdmin: async () => {
    if (!supabase) {
      set({ error: 'Supabase no configurado' })
      return
    }
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'admin')
      .is('recipient_id', null)
      .order('created_at', { ascending: false })
      .limit(100)
    set({ loading: false })
    if (error) {
      set({ error: error.message, items: [] })
      return
    }
    set({ items: data || [], unreadCount: (data || []).filter(n => !n.read).length, error: null })
  },

  fetchForVendor: async (vendorId) => {
    if (!supabase || !vendorId) return
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'vendor')
      .eq('recipient_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(100)
    set({ loading: false })
    if (error) {
      set({ error: error.message, items: [] })
      return
    }
    set({ items: data || [], unreadCount: (data || []).filter(n => !n.read).length, error: null })
  },

  markAsRead: async (id) => {
    if (!supabase) return
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    set(state => ({
      items: state.items.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  markAllAsRead: async (recipientType, recipientId = null) => {
    if (!supabase) return
    let q = supabase.from('notifications').update({ read: true }).eq('recipient_type', recipientType).eq('read', false)
    if (recipientId !== null) q = q.eq('recipient_id', recipientId)
    else q = q.is('recipient_id', null)
    await q
    set(state => ({
      items: state.items.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }))
  },

  reset: () => set({ items: [], unreadCount: 0 })
}))
