import { create } from 'zustand'

// Helper to save to localStorage
const saveToStorage = (state) => {
  localStorage.setItem('magari-cart-storage', JSON.stringify({
    items: state.items
  }))
}

// Helper to load from localStorage
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('magari-cart-storage')
    return stored ? JSON.parse(stored) : { items: [] }
  } catch {
    return { items: [] }
  }
}

// Cart store with localStorage persistence
export const useCartStore = create((set, get) => ({
  items: loadFromStorage().items,
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
      saveToStorage({ items: newItems })
    } else {
      const newItems = [...items, { ...product, quantity: 1 }]
      set({ items: newItems })
      saveToStorage({ items: newItems })
    }
  },
  
  removeItem: (productId) => {
    const newItems = get().items.filter(item => item.id !== productId)
    set({ items: newItems })
    saveToStorage({ items: newItems })
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
    saveToStorage({ items: newItems })
  },
  
  clearCart: () => {
    set({ items: [] })
    saveToStorage({ items: [] })
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
