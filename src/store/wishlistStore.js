import { create } from 'zustand'

// Helper to save to localStorage
const saveToStorage = (items) => {
  localStorage.setItem('magari-wishlist-storage', JSON.stringify(items))
}

// Helper to load from localStorage
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('magari-wishlist-storage')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Wishlist store with localStorage persistence
export const useWishlistStore = create((set, get) => ({
  items: loadFromStorage(),
  
  addItem: (product) => {
    const items = get().items
    if (!items.find(item => item.id === product.id)) {
      const newItems = [...items, product]
      set({ items: newItems })
      saveToStorage(newItems)
    }
  },
  
  removeItem: (productId) => {
    const newItems = get().items.filter(item => item.id !== productId)
    set({ items: newItems })
    saveToStorage(newItems)
  },
  
  isInWishlist: (productId) => {
    return get().items.some(item => item.id === productId)
  },
  
  clearWishlist: () => {
    set({ items: [] })
    saveToStorage([])
  },
}))

