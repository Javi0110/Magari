import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LogIn, 
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Settings, 
  Check, 
  X,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Image as ImageIcon,
  Upload,
  Bell
} from 'lucide-react'
import { sampleTestimonials } from '../data/sampleData'
import { useProductsStore } from '../store/productsStore'
import { supabase } from '../utils/supabase'
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../utils/emailRelay'
import { useNotificationsStore } from '../store/notificationsStore'

function AdminNotificationsDropdown({ notifications, error, onMarkAsRead, onMarkAllAsRead, onClose, onNotificationClick }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[400px] overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-lg z-50">
        <div className="p-3 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
          <span className="font-semibold text-neutral-700">Notificaciones</span>
          {notifications.some(n => !n.read) && (
            <button type="button" onClick={onMarkAllAsRead} className="text-sm text-sage hover:underline">
              Marcar todas leídas
            </button>
          )}
        </div>
        <div className="divide-y divide-neutral-100">
          {error && (
            <div className="p-4 bg-amber-50 border-b border-amber-200">
              <p className="text-amber-800 text-sm font-medium">No se pudieron cargar las notificaciones.</p>
              {error.includes('configurado') ? (
                <p className="text-amber-700 text-xs mt-1">En Netlify añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Environment variables y vuelve a desplegar.</p>
              ) : (
                <p className="text-amber-700 text-xs mt-1">Ejecuta en Supabase (SQL Editor) la migración: <code className="bg-amber-100 px-1 rounded">20260128400000_notifications_and_orders.sql</code></p>
              )}
            </div>
          )}
          {!error && notifications.length === 0 && (
            <p className="p-4 text-neutral-500 text-sm">No hay notificaciones aún. Aparecerán cuando alguien solicite ser vendor o haga una compra.</p>
          )}
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-3 text-left hover:bg-neutral-50 cursor-pointer ${!n.read ? 'bg-sage/5' : ''}`}
              onClick={() => {
                if (!n.read) onMarkAsRead(n.id)
                if (onNotificationClick) onNotificationClick(n)
              }}
            >
              <p className="font-medium text-neutral-800 text-sm">{n.title}</p>
              <p className="text-neutral-600 text-xs mt-0.5">{n.body}</p>
              <p className="text-neutral-400 text-xs mt-1">
                {n.created_at ? new Date(n.created_at).toLocaleString('es-PR') : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const ADMIN_EMAIL = 'magaribyelena@gmail.com'
const ADMIN_PASSWORD = 'isabella!4'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [highlightedApplicationId, setHighlightedApplicationId] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const { items: notifications, unreadCount, error: notificationsError, fetchForAdmin, markAsRead, markAllAsRead } = useNotificationsStore()

  useEffect(() => {
    if (isLoggedIn) fetchForAdmin()
  }, [isLoggedIn, fetchForAdmin])

  const handleNotificationClick = (notification) => {
    const payload = notification?.payload || {}
    if (notification.type === 'vendor_application' && payload.application_id) {
      setActiveTab('vendors')
      setHighlightedApplicationId(payload.application_id)
      setShowNotifications(false)
    } else if (notification.type && notification.type.toLowerCase().includes('order')) {
      setActiveTab('orders')
      setShowNotifications(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    const trimmedEmail = (email || '').trim().toLowerCase()
    if (trimmedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setLoginError('Email o contraseña incorrectos.')
      return
    }
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream py-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-neutral-500" />
              </div>
              <h1 className="font-serif text-3xl text-neutral-700 mb-2">
                Admin Login
              </h1>
              <p className="text-neutral-600 text-sm">
                Solo personal autorizado
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{loginError}</p>
              )}
              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="magaribyelena@gmail.com"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                Sign In
              </button>
            </form>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-neutral-700 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-neutral-600">
              Manage your store, vendors, and content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 border border-neutral-200/80"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="font-medium text-neutral-700 hidden sm:inline">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-sage text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <AdminNotificationsDropdown
                  notifications={notifications}
                  error={notificationsError}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={() => markAllAsRead('admin', null)}
                  onClose={() => setShowNotifications(false)}
                  onNotificationClick={handleNotificationClick}
                />
              )}
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="btn-outline"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: <TrendingUp className="w-4 h-4" />, label: 'Dashboard' },
            { id: 'products', icon: <Package className="w-4 h-4" />, label: 'Products' },
            { id: 'orders', icon: <ShoppingBag className="w-4 h-4" />, label: 'Orders' },
            { id: 'vendors', icon: <Users className="w-4 h-4" />, label: 'Vendors' },
            { id: 'reviews', icon: <MessageSquare className="w-4 h-4" />, label: 'Reviews' },
            { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sage text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'vendors' && (
          <VendorsView
            highlightedApplicationId={highlightedApplicationId}
            onClearHighlight={() => setHighlightedApplicationId(null)}
          />
        )}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  )
}

// Dashboard View – datos reales desde Supabase
function DashboardView() {
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, vendorsCount: 0, productsCount: 0, pendingApplications: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const load = async () => {
      const [ordersRes, vendorsRes, productsRes, applicationsRes] = await Promise.all([
        supabase.from('orders').select('id, total'),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])
      const orders = ordersRes.data || []
      const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
      const { data: recent } = await supabase.from('orders').select('id, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5)
      setStats({
        revenue,
        ordersCount: orders.length,
        vendorsCount: vendorsRes.count ?? 0,
        productsCount: productsRes.count ?? 0,
        pendingApplications: applicationsRes.count ?? 0
      })
      setRecentOrders(recent || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="card p-6"><p className="text-neutral-600">Cargando…</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'turquoise' },
          { label: 'Orders', value: String(stats.ordersCount), color: 'orange' },
          { label: 'Active Vendors', value: String(stats.vendorsCount), color: 'lime' },
          { label: 'Products', value: String(stats.productsCount), color: 'neutral-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
          >
            <p className="text-neutral-600 text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color} mb-1`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-serif text-xl text-neutral-700 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 && <p className="text-neutral-500 text-sm">No hay pedidos aún.</p>}
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                <div>
                  <p className="font-medium text-neutral-700">Order #{order.id}</p>
                  <p className="text-sm text-neutral-500">{order.customer_name} · ${Number(order.total).toFixed(2)}</p>
                </div>
                <span className="badge bg-taupe/20 text-taupe-dark">{order.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-serif text-xl text-neutral-700 mb-4">Pending Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-200">
              <p className="text-neutral-700">Vendor applications</p>
              <span className="badge bg-earth/20 text-earth-dark">{stats.pendingApplications} pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Products View
function ProductsView() {
  const { products, getAllProducts, deleteProduct, getInventoryStats, initProducts, loading, error } = useProductsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  useEffect(() => {
    initProducts().catch(() => {})
  }, [initProducts])
  
  const magariProducts = getAllProducts()
  const stats = getInventoryStats()
  
  // Filter products
  const filteredProducts = magariProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(magariProducts.map(p => p.category))]

  return (
    <div>
      {/* Header with Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-stone text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold text-sage">{stats.totalProducts}</p>
        </div>
        <div className="card">
          <p className="text-stone text-sm mb-1">Total Inventory Value</p>
          <p className="text-3xl font-bold text-earth">${stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-stone text-sm mb-1">Categories</p>
          <p className="text-3xl font-bold text-taupe-dark">{Object.keys(stats.byCategory).length}</p>
        </div>
        <div className="card">
          <p className="text-stone text-sm mb-1">Average Price</p>
          <p className="text-3xl font-bold text-stone">
            ${stats.totalProducts > 0 ? Math.round(stats.totalValue / stats.totalProducts) : 0}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <div className="flex gap-4 flex-1 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-initial md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field w-auto min-w-[150px]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingProduct(null)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-greige-light">
            <tr className="text-left">
              <th className="py-3 px-4 font-semibold text-sage-dark">Product</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Category</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Room</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Price</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Tags</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-stone">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-cream-dark last:border-0 hover:bg-cream/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-greige-light rounded-lg flex-shrink-0 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-stone-light" />
                      </div>
                      <div>
                        <p className="font-medium text-sage-dark">{product.title}</p>
                        <p className="text-xs text-stone line-clamp-1 max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-handmade text-xs">{product.category}</span>
                  </td>
                  <td className="py-3 px-4 text-stone text-sm">{product.room}</td>
                  <td className="py-3 px-4 font-semibold text-sage">${product.price}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {product.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="badge badge-handmade text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setShowAddForm(true)
                        }}
                        className="text-sage hover:text-sage-dark transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${product.title}"? This cannot be undone.`)) {
                            deleteProduct(product.id)
                          }
                        }}
                        className="text-stone hover:text-earth transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

// Product Form Component
function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useProductsStore()
  const [uploadedImages, setUploadedImages] = useState(() => {
    // Convert existing image URLs to preview format
    if (product?.images) {
      return product.images.map((url, index) => ({
        id: `existing-${index}`,
        url: url,
        preview: url,
        isExisting: true
      }))
    }
    return []
  })
  const [isDragging, setIsDragging] = useState(false)
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    price: product?.price || '',
    category: product?.category || 'Handmade',
    room: product?.room || 'Any',
    description: product?.description || '',
    materials: product?.materials || '',
    dimensions: product?.dimensions || '',
    images: product?.images?.join(', ') || '',
    tags: product?.tags?.join(', ') || 'magari',
    shipping: product?.shipping || 'Ships from San Juan, PR to USA & PR',
    returnPolicy: product?.returnPolicy || '30-day returns accepted',
  })

  // Handle image file uploads
  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map((file) => {
      if (file.type.startsWith('image/')) {
        const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const preview = URL.createObjectURL(file)
        return {
          id,
          file,
          preview,
          isExisting: false
        }
      }
      return null
    }).filter(Boolean)
    
    setUploadedImages(prev => [...prev, ...newImages])
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }
  
  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleImageUpload(files)
    }
    // Reset input to allow selecting same file again
    e.target.value = ''
  }
  
  const removeImage = (id) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id)
      // Revoke object URL to prevent memory leak
      if (image && !image.isExisting && image.preview) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }
  
  // Convert uploaded images to data URLs or keep existing URLs
  const getImageUrls = async () => {
    const urls = []
    for (const img of uploadedImages) {
      if (img.isExisting) {
        urls.push(img.url)
      } else if (img.file) {
        // Convert file to base64 data URL
        const reader = new FileReader()
        const promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(img.file)
        })
        const dataUrl = await promise
        urls.push(dataUrl)
      }
    }
    return urls
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Get image URLs from uploaded files
    const imageUrls = await getImageUrls()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      images: imageUrls.length > 0 ? imageUrls : formData.images.split(',').map(img => img.trim()).filter(img => img),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    }

    if (product) {
      updateProduct(product.id, productData)
    } else {
      addProduct(productData)
    }
    
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
        onClick={onClose}
      />
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[60] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-sage-dark">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-stone hover:text-sage-dark"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Elementos Collection Tray"
                />
              </div>

              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="48.00"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="Handmade">Handmade</option>
                  <option value="Elementos Collection">Elementos Collection</option>
                  <option value="Curated">Curated</option>
                  <option value="Bundles">Bundles</option>
                </select>
              </div>

              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Room *
                </label>
                <select
                  required
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="input-field"
                >
                  <option value="Any">Any</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Living Room">Living Room</option>
                  <option value="Bedroom">Bedroom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sage-dark font-medium mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-24"
                placeholder="Handcrafted ceramic tray with organic earth tones..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Materials
                </label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  className="input-field"
                  placeholder="Ceramic, hand-glazed"
                />
              </div>

              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="input-field"
                  placeholder='12" x 8" x 1.5"'
                />
              </div>
            </div>

            <div>
              <label className="block text-sage-dark font-medium mb-2">
                Product Images *
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  isDragging ? 'border-sage bg-sage/10' : 'border-greige-light'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto w-10 h-10 text-sage mb-3" />
                <p className="text-sm text-neutral-600 mb-1">
                  Arrastra y suelta imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-neutral-400 mb-4">
                  Formatos: JPG, PNG, WEBP. Máx 10MB por imagen.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="admin-product-images-upload"
                />
                <label
                  htmlFor="admin-product-images-upload"
                  className="inline-flex px-4 py-2 rounded-full bg-sage text-white text-sm cursor-pointer hover:bg-sage/90 transition-colors"
                >
                  Seleccionar imágenes
                </label>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden bg-neutral-100 group">
                      <img
                        src={img.preview}
                        alt="Product preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-stone-light mt-2">
                También puedes usar URLs de imágenes separadas por comas en el campo alternativo
              </p>
              <input
                type="text"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="input-field mt-2"
                placeholder="/products/image.jpg, /products/image-2.jpg (alternativa a carga de archivos)"
              />
            </div>

            <div>
              <label className="block text-sage-dark font-medium mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="handmade, magari"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Shipping Info
                </label>
                <input
                  type="text"
                  value={formData.shipping}
                  onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                  className="input-field"
                  placeholder="Ships from San Juan, PR to USA & PR"
                />
              </div>

              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Return Policy
                </label>
                <input
                  type="text"
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  className="input-field"
                  placeholder="30-day returns accepted"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-cream-dark">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// Orders View
function OrdersView() {
  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const load = async () => {
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      setOrders(ordersData || [])
      const { data: itemsData } = await supabase.from('order_items').select('*')
      const byOrder = {}
      ;(itemsData || []).forEach(item => {
        if (!byOrder[item.order_id]) byOrder[item.order_id] = []
        byOrder[item.order_id].push(item)
      })
      setOrderItems(byOrder)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="card p-6"><p className="text-neutral-600">Cargando pedidos…</p></div>

  return (
    <div>
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Pedidos</h2>
      {orders.length === 0 && (
        <p className="text-neutral-600">Aún no hay pedidos.</p>
      )}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card p-4 border border-neutral-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-neutral-800">Pedido #{order.id}</p>
                <p className="text-sm text-neutral-500">{order.customer_name} · {order.customer_email}</p>
                {order.shipping_address && <p className="text-xs text-neutral-500">{order.shipping_address}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-700">${Number(order.total).toFixed(2)}</p>
                <span className="badge bg-neutral-200 text-neutral-700">{order.status}</span>
              </div>
            </div>
            <ul className="text-sm text-neutral-600 border-t border-neutral-100 pt-2 mt-2">
              {(orderItems[order.id] || []).map(item => (
                <li key={item.id}>· {item.product_title} × {item.quantity} — ${Number(item.price).toFixed(2)}</li>
              ))}
            </ul>
            <p className="text-xs text-neutral-400 mt-2">
              {order.created_at ? new Date(order.created_at).toLocaleString('es-PR') : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Generate a random access code for approved vendors (e.g. 8 alphanumeric)
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}

// Vendors View – MOMade applications from Supabase
function VendorsView({ highlightedApplicationId = null, onClearHighlight }) {
  const [applications, setApplications] = useState([])
  const [approvedVendors, setApprovedVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const loadApplications = async () => {
    if (!supabase) {
      setLoadError('Supabase no configurado. Revisa tu .env')
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const { data: apps, error: appsErr } = await supabase
        .from('vendor_applications')
        .select('*')
        .order('submitted_at', { ascending: false })
      if (appsErr) {
        setLoadError(appsErr.message || 'Error al cargar solicitudes. ¿Ejecutaste la migración vendor_applications en Supabase?')
        setApplications([])
      } else {
        setApplications(apps || [])
      }
      const { data: vendors, error: vendorsErr } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })
      if (!vendorsErr) setApprovedVendors(vendors || [])
    } catch (e) {
      console.error(e)
      setLoadError(e.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleApprove = async (app) => {
    if (!supabase || !app?.id) return
    setActionLoading(app.id)
    try {
      // Usa upsert para evitar el error de clave duplicada en email
      const accessCode = generateAccessCode()
      const { error: upsertErr } = await supabase
        .from('vendors')
        .upsert(
          {
            application_id: app.id,
            email: app.email,
            name: app.name,
            business_name: app.business_name,
            access_code: accessCode,
            status: 'active'
          },
          { onConflict: 'email' }
        )
      if (upsertErr) throw upsertErr

      await supabase
        .from('vendor_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', app.id)
      const emailResult = await sendVendorApprovalEmail({
        email: app.email,
        name: app.name,
        businessName: app.business_name,
        accessCode,
        loginUrl: `${window.location.origin}/marketplace`
      })
      if (!emailResult?.success) {
        console.error('Error enviando email de aprobación al vendor:', emailResult?.error)
        alert(
          'La solicitud se aprobó, pero el email al vendor NO se pudo enviar.\n\n' +
          'Detalle técnico: ' + (emailResult?.error || 'sin mensaje de error') +
          '\n\nHaz una captura de este mensaje y envíamela para que te diga exactamente qué tocar en Resend/Netlify.'
        )
      }
      await loadApplications()
    } catch (err) {
      console.error(err)
      let msg = err?.message || ''
      if (err?.code === '23505') {
        msg = 'Ya existe un vendor con este email en la tabla vendors de Supabase.'
      }
      alert('Error al aprobar: ' + (msg || 'intenta de nuevo'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (app) => {
    if (!supabase || !app?.id) return
    setActionLoading(app.id)
    try {
      await supabase
        .from('vendor_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', app.id)
      const emailResult = await sendVendorRejectionEmail({
        email: app.email,
        name: app.name,
        businessName: app.business_name
      })
      if (!emailResult?.success) {
        console.error('Error enviando email de rechazo al vendor:', emailResult?.error)
        alert(
          'La solicitud se marcó como RECHAZADA, pero el email al vendor NO se pudo enviar.\n\n' +
          'Detalle técnico: ' + (emailResult?.error || 'sin mensaje de error') +
          '\n\nHaz una captura de este mensaje y envíamela para que te diga exactamente qué tocar en Resend/Netlify.'
        )
      }
      await loadApplications()
    } catch (err) {
      console.error(err)
      alert('Error al rechazar: ' + (err.message || 'intenta de nuevo'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteApplication = async (app) => {
    if (!supabase || !app?.id) return
    if (!confirm(`¿Eliminar la solicitud de ${app.business_name}? Esto también eliminará la cuenta de vendor asociada (si existe) y no se puede deshacer.`)) return
    setActionLoading(app.id)
    try {
      // Primero elimina cualquier vendor creado a partir de esta solicitud
      const { error: vendorErr } = await supabase
        .from('vendors')
        .delete()
        .eq('application_id', app.id)
      if (vendorErr) {
        console.error('Error al eliminar vendor asociado:', vendorErr)
      }

      // Luego elimina la solicitud
      const { error: appErr } = await supabase
        .from('vendor_applications')
        .delete()
        .eq('id', app.id)
      if (appErr) throw appErr

      await loadApplications()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar: ' + (err.message || 'intenta de nuevo'))
    } finally {
      setActionLoading(null)
    }
  }

  const pending = applications.filter(a => a.status === 'pending')
  const approved = applications.filter(a => a.status === 'approved')
  const rejected = applications.filter(a => a.status === 'rejected')

  // Si venimos desde una notificación, desplaza y resalta la solicitud correspondiente
  useEffect(() => {
    if (!highlightedApplicationId || !applications.length) return
    const el = document.querySelector(`[data-application-id="${highlightedApplicationId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-sage', 'ring-offset-2')
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-sage', 'ring-offset-2')
      }, 2500)
    }
    if (onClearHighlight) onClearHighlight()
  }, [highlightedApplicationId, applications, onClearHighlight])

  if (loading) {
    return (
      <div>
        <h2 className="font-serif text-2xl text-neutral-700 mb-6">Vendor Applications (MOMade)</h2>
        <p className="text-neutral-600">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Vendor Applications (MOMade)</h2>
      <p className="text-neutral-600 mb-6">Solicitudes del formulario del marketplace. Aprueba o rechaza y se enviará un email al solicitante.</p>

      {loadError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium text-sm">No se pudieron cargar las solicitudes</p>
          <p className="text-amber-700 text-xs mt-1">{loadError}</p>
          {loadError.includes('no configurado') || loadError.includes('Supabase') ? (
            <p className="text-amber-700 text-xs mt-2">Si estás en la web en vivo (Netlify): Site settings → Environment variables → añade <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> y <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>, luego vuelve a desplegar.</p>
          ) : (
            <>
              <p className="text-amber-700 text-xs mt-2">En Supabase → SQL Editor ejecuta estas migraciones (en este orden):</p>
              <ul className="text-xs text-amber-800 mt-1 list-disc list-inside">
                <li><code>20260128100000_create_vendor_applications_and_vendors.sql</code></li>
                <li><code>20260128400000_notifications_and_orders.sql</code></li>
              </ul>
            </>
          )}
        </div>
      )}

      {/* Pending */}
      <div className="mb-8">
        <h3 className="font-semibold text-neutral-700 mb-3">Pending ({pending.length})</h3>
        <div className="space-y-4">
          {!loadError && pending.length === 0 && <p className="text-neutral-500 text-sm">No hay solicitudes pendientes. Cuando alguien envíe el formulario en Marketplace aparecerán aquí.</p>}
          {pending.map(app => (
            <div
              key={app.id}
              data-application-id={app.id}
              className="card border border-neutral-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-neutral-800">{app.business_name}</p>
                  <p className="text-sm text-neutral-500">{app.name} · {app.email}</p>
                  {app.phone && <p className="text-sm text-neutral-500">Tel: {app.phone}</p>}
                  {app.instagram && <p className="text-sm text-neutral-500">Instagram: {app.instagram}</p>}
                  <p className="text-xs text-neutral-400 mt-1">
                    Enviado: {app.submitted_at ? new Date(app.submitted_at).toLocaleString('es-PR') : '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(app)}
                    disabled={!!actionLoading}
                    className="btn-primary py-2 px-4 flex items-center text-sm"
                  >
                    {actionLoading === app.id ? '…' : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                  </button>
                  <button
                    onClick={() => handleReject(app)}
                    disabled={!!actionLoading}
                    className="btn-outline py-2 px-4 flex items-center text-sm"
                  >
                    {actionLoading === app.id ? '…' : <><X className="w-4 h-4 mr-1" /> Reject</>}
                  </button>
                </div>
              </div>
              <div className="text-sm text-neutral-600 border-t border-neutral-100 pt-3 mt-3 space-y-1">
                {app.categories?.length > 0 && <p><strong>Categorías:</strong> {app.categories.join(', ')}</p>}
                {app.bio && <p><strong>Bio:</strong> {app.bio}</p>}
                <p><strong>Pago:</strong> {app.payout_method} – {app.payout_email}</p>
                {Array.isArray(app.form_data?.sampleImages) && app.form_data.sampleImages.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-neutral-700 mb-2">Imágenes de muestra</p>
                    <div className="flex flex-wrap gap-2">
                      {app.form_data.sampleImages.map((dataUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewImage(dataUrl)}
                          className="block w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90"
                        >
                          <img src={dataUrl} alt={`Muestra ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {app.form_data?.sampleImageCount != null && (!Array.isArray(app.form_data?.sampleImages) || app.form_data.sampleImages.length === 0) && (
                  <p><strong>Imágenes de muestra:</strong> {app.form_data.sampleImageCount}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approved */}
      <div className="mb-8">
        <h3 className="font-semibold text-neutral-700 mb-3">Approved ({approved.length})</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {approved.length === 0 && <p className="text-neutral-500 text-sm">None yet.</p>}
          {approved.map(app => (
            <div
              key={app.id}
              data-application-id={app.id}
              className="card flex flex-wrap items-start justify-between gap-2"
            >
              <div>
                <p className="font-medium text-neutral-700">{app.business_name}</p>
                <p className="text-sm text-neutral-500">by {app.name} · {app.email}</p>
                <span className="badge badge-handmade mt-2">Approved</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteApplication(app)}
                disabled={!!actionLoading}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar solicitud"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rejected */}
      <div>
        <h3 className="font-semibold text-neutral-700 mb-3">Rejected ({rejected.length})</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {rejected.length === 0 && <p className="text-neutral-500 text-sm">None.</p>}
          {rejected.map(app => (
            <div
              key={app.id}
              data-application-id={app.id}
              className="card opacity-75 flex flex-wrap items-start justify-between gap-2"
            >
              <div>
                <p className="font-medium text-neutral-700">{app.business_name}</p>
                <p className="text-sm text-neutral-500">by {app.name}</p>
                <span className="badge bg-neutral-400 text-white mt-2">Rejected</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteApplication(app)}
                disabled={!!actionLoading}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar solicitud"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="Vista previa" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

// Reviews View
function ReviewsView() {
  const [reviews, setReviews] = useState(
    sampleTestimonials.map(t => ({ ...t, status: t.approved ? 'approved' : 'pending' }))
  )

  const handleApproveReview = (reviewId) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, approved: true, status: 'approved' } : r
    ))
    // 🔌 INTEGRATION: PATCH /api/testimonials/:id with { approved: true }
  }

  const handleRejectReview = (reviewId) => {
    setReviews(reviews.filter(r => r.id !== reviewId))
    // 🔌 INTEGRATION: DELETE /api/testimonials/:id
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Review Moderation</h2>

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-neutral-700">{review.name}</p>
                <div className="flex gap-1 my-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-taupe">★</span>
                  ))}
                </div>
              </div>
              <span className={`badge ${review.status === 'approved' ? 'badge-handmade' : 'bg-earth/20 text-earth-dark'}`}>
                {review.status}
              </span>
            </div>

            <p className="text-neutral-600 mb-4">"{review.text}"</p>

            {review.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproveReview(review.id)}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectReview(review.id)}
                  className="btn-outline py-2 px-4 text-sm"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Settings View
function SettingsView() {
  const [commission, setCommission] = useState(12)
  const [zapierUrl, setZapierUrl] = useState('')
  const [zapierSaving, setZapierSaving] = useState(false)
  const [zapierSaved, setZapierSaved] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('app_settings').select('value').eq('key', 'zapier_webhook_url').maybeSingle()
      .then(({ data }) => { if (data?.value) setZapierUrl(data.value) })
  }, [])

  const saveZapierUrl = async () => {
    if (!supabase) return
    setZapierSaving(true)
    setZapierSaved(false)
    const { error } = await supabase.from('app_settings').upsert(
      { key: 'zapier_webhook_url', value: zapierUrl.trim() },
      { onConflict: 'key' }
    )
    setZapierSaving(false)
    if (!error) setZapierSaved(true)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Notificaciones Zapier */}
        <div className="card p-6">
          <h3 className="font-semibold text-neutral-700 mb-2">Notificaciones (Zapier / Make)</h3>
          <p className="text-neutral-600 text-sm mb-4">
            Cada vez que alguien solicite ser vendor, se enviará un POST a esta URL. Crea un Zap en Zapier con trigger &quot;Catch Hook&quot; y pega aquí la URL que te den. Así recibirás un email en magaribyelena@gmail.com.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="url"
              value={zapierUrl}
              onChange={(e) => setZapierUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="input-field flex-1 min-w-[200px] font-mono text-sm"
            />
            <button
              type="button"
              onClick={saveZapierUrl}
              disabled={zapierSaving}
              className="btn-primary"
            >
              {zapierSaving ? 'Guardando…' : 'Guardar URL'}
            </button>
          </div>
          {zapierSaved && <p className="text-green-600 text-sm mt-2">URL guardada. Las próximas solicitudes de vendor enviarán el aviso a Zapier.</p>}
        </div>

        {/* Marketplace Commission */}
        <div className="card p-6">
          <h3 className="font-semibold text-neutral-700 mb-4">
            <DollarSign className="w-5 h-5 inline-block mr-2" />
            Marketplace Commission
          </h3>
          <p className="text-neutral-600 text-sm mb-4">
            Platform fee taken from each vendor sale
          </p>

          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="100"
              value={commission}
              onChange={(e) => setCommission(parseInt(e.target.value))}
              className="input-field w-24"
            />
            <span className="text-neutral-700">%</span>
          </div>

          <div className="mt-4 p-4 bg-cream rounded-xl">
            <p className="text-sm text-neutral-600">
              Example: $100 sale → Platform gets ${commission} → Vendor gets ${100 - commission}
            </p>
          </div>

          <button className="mt-4 btn-primary">
            Save Changes
          </button>
        </div>

        {/* Integration Keys */}
        <div className="card p-6">
          <h3 className="font-semibold text-neutral-700 mb-4">
            <Settings className="w-5 h-5 inline-block mr-2" />
            Integration Keys
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-neutral-700 font-medium mb-2">
                Stripe Publishable Key
              </label>
              <input
                type="text"
                placeholder="pk_live_..."
                className="input-field font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-medium mb-2">
                SendGrid API Key
              </label>
              <input
                type="password"
                placeholder="SG...."
                className="input-field font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-medium mb-2">
                Supabase URL
              </label>
              <input
                type="text"
                placeholder="https://xxxxx.supabase.co"
                className="input-field font-mono text-sm"
              />
            </div>
          </div>

          <button className="mt-4 btn-primary">
            Save Keys
          </button>

          <p className="text-xs text-neutral-500 mt-3">
            🔌 Store these in environment variables, not in the database
          </p>
        </div>
      </div>
    </div>
  )
}

