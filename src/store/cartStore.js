import { create } from 'zustand'

const STORAGE_KEY = 'magari-cart-storage'

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

// Helper to save to localStorage
const saveToStorage = (items) => {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

// Helper to load from localStorage
const loadFromStorage = () => {
  if (!canUseStorage()) return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)

    // Support both array-only and { items: [] } formats
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.items)) return parsed.items
    return []
  } catch {
    return []
  }
}

// Cart store with localStorage persistence
export const useCartStore = create((set, get) => ({
  items: loadFromStorage(),
  isOpen: false,
  
  addItem: (product) => {
    const items = get().items
    const existingItem = items.find(item => item.id === product.id)
    
    if (existingItem) {
      const newItems = items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      set({ items: newItems })
      saveToStorage(newItems)
    } else {
      const newItems = [...items, { ...product, quantity: 1 }]
      set({ items: newItems })
      saveToStorage(newItems)
    }
  },
  
  removeItem: (productId) => {
    const newItems = get().items.filter(item => item.id !== productId)
    set({ items: newItems })
    saveToStorage(newItems)
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    
    const newItems = get().items.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
    set({ items: newItems })
    saveToStorage(newItems)
  },
  
  clearCart: () => {
    set({ items: [] })
    saveToStorage([])
  },
  
  toggleCart: () => set({ isOpen: !get().isOpen }),
  
  openCart: () => set({ isOpen: true }),
  
  closeCart: () => set({ isOpen: false }),
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  }
}))
