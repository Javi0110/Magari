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
import { SHOP_MAGARI_CATEGORIES, SHIPPING_OPTIONS, RETURN_POLICY_OPTIONS } from '../constants/shopCategories'
import {
  parseFulfillmentModes,
  serializeFulfillmentModes,
  FULFILLMENT_MODE_KEYS,
  FULFILLMENT_MODE_LABELS,
} from '../utils/fulfillment'
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../utils/emailRelay'
import { useNotificationsStore } from '../store/notificationsStore'

function slugify(title) {
  const s = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || `product-${Date.now()}`
}

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
            { id: 'payouts', icon: <DollarSign className="w-4 h-4" />, label: 'Payouts' },
            { id: 'vendors', icon: <Users className="w-4 h-4" />, label: 'Vendors' },
            { id: 'services', icon: <Settings className="w-4 h-4" />, label: 'Services' },
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
        {activeTab === 'payouts' && <PayoutsView />}
        {activeTab === 'services' && <ServicesView />}
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
      {!supabase && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong className="font-semibold">Supabase no está conectado.</strong>{' '}
          Los productos del Shop Magari se guardan en la tabla{' '}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">shop_products</code>. Define{' '}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">VITE_SUPABASE_URL</code> y{' '}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code> en{' '}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">.env</code>, guarda el archivo y reinicia{' '}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">npm run dev</code>.
        </div>
      )}
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
              <th className="py-3 px-4 font-semibold text-sage-dark">Stock</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Tags</th>
              <th className="py-3 px-4 font-semibold text-sage-dark">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-cream-dark last:border-0 hover:bg-cream/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-greige-light rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {Array.isArray(product.images) && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-stone-light" />
                        )}
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
                  <td className="py-3 px-4 text-stone text-sm">{product.stock ?? 0}</td>
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
  const [saving, setSaving] = useState(false)
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
    category: product?.category || SHOP_MAGARI_CATEGORIES[0],
    room: product?.room || 'Any',
    description: product?.description || '',
    materials: product?.materials || '',
    dimensions: product?.dimensions || '',
    images: product?.images?.join(', ') || '',
    tags: product?.tags?.join(', ') || 'magari',
    shipping: product?.shipping || SHIPPING_OPTIONS[0],
    returnPolicy: product?.returnPolicy || RETURN_POLICY_OPTIONS[0],
    stock: product?.stock ?? 0,
    fulfillmentModes: parseFulfillmentModes(product?.fulfillment),
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
    if (saving) return

    if (!formData.fulfillmentModes?.length) {
      alert('Choose at least one fulfillment option (pickup, shipping, and/or delivery).')
      return
    }

    const priceRaw = String(formData.price ?? '').replace(/,/g, '').trim()
    const priceNum = parseFloat(priceRaw)
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      alert('Enter a valid price (0 or greater).')
      return
    }

    if (!(formData.title || '').trim()) {
      alert('Enter a product title.')
      return
    }

    if (!supabase) {
      alert(
        'Supabase no está conectado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env (en la raíz del proyecto), guarda y reinicia el servidor con npm run dev. Sin eso, el producto no se puede guardar en la base de datos.'
      )
      return
    }

    setSaving(true)
    try {
      const imageUrls = await getImageUrls()

      const productData = {
        ...formData,
        title: (formData.title || '').trim(),
        price: priceNum,
        stock: Math.max(0, parseInt(formData.stock, 10) || 0),
        images: imageUrls.length > 0 ? imageUrls : formData.images.split(',').map((img) => img.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        fulfillment: serializeFulfillmentModes(formData.fulfillmentModes),
      }
      delete productData.fulfillmentModes

      if (!product) {
        productData.slug = `${slugify(formData.title)}-${Date.now().toString(36)}`
      }

      if (product) {
        await updateProduct(product.id, productData)
      } else {
        await addProduct(productData)
      }

      onClose()
    } catch (err) {
      console.error('Save product failed:', err)
      const msg =
        err?.message ||
        err?.error_description ||
        err?.details ||
        (typeof err === 'string' ? err : null) ||
        'Could not save. Check your connection and Supabase configuration.'
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
      <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
        onClick={() => {
          if (!saving) onClose()
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[60] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="product-form-title" className="font-serif text-2xl text-sage-dark">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!saving) onClose()
              }}
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
                  {SHOP_MAGARI_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                  Quantity in stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
                <p className="text-xs text-neutral-500 mt-1">Stock is reduced automatically when a customer completes a purchase.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sage-dark font-medium mb-2">
                  Fulfillment (choose any that apply)
                </label>
                <div className="space-y-2 rounded-xl border border-greige-light p-3 bg-cream/30">
                  {FULFILLMENT_MODE_KEYS.map((key) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        className="mt-0.5 text-sage rounded border-greige-light"
                        checked={formData.fulfillmentModes.includes(key)}
                        onChange={() => {
                          const set = new Set(formData.fulfillmentModes)
                          if (set.has(key)) {
                            set.delete(key)
                            if (set.size === 0) set.add('shipping')
                          } else {
                            set.add(key)
                          }
                          const next = FULFILLMENT_MODE_KEYS.filter((k) => set.has(k))
                          setFormData({ ...formData, fulfillmentModes: next })
                        }}
                      />
                      <span>{FULFILLMENT_MODE_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Customers only see checkout options that match what you enable. Delivery is limited to 30 miles from 75 Jan Ln, Georgetown, TX.
                </p>
              </div>
              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Shipping (display text)
                </label>
                <select
                  value={formData.shipping}
                  onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                  className="input-field"
                >
                  {SHIPPING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sage-dark font-medium mb-2">
                  Return policy
                </label>
                <select
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  className="input-field"
                >
                  {RETURN_POLICY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
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
                disabled={saving}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : product ? 'Update Product' : 'Add Product'}
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

// Payouts View – resumen por vendor + historial
function PayoutsView() {
  const [vendors, setVendors] = useState([])
  const [payouts, setPayouts] = useState([])
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterVendorId, setFilterVendorId] = useState('all')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [form, setForm] = useState({
    vendorId: '',
    amount: '',
    paymentMethod: '',
    paymentReference: '',
    notes: '',
  })

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const load = async () => {
      // Vendors + preferred payout info (via application)
      const { data: vendorsData } = await supabase.from('vendors').select('id, business_name, application_id, email')
      const vendors = vendorsData || []
      let payoutPrefs = {}
      const appIds = vendors.map(v => v.application_id).filter(Boolean)
      if (appIds.length > 0) {
        const { data: apps } = await supabase
          .from('vendor_applications')
          .select('id, payout_method, payout_email')
          .in('id', appIds)
        payoutPrefs = (apps || []).reduce((acc, a) => ({ ...acc, [a.id]: a }), {})
      }

      // Payout history
      const { data: payoutsData } = await supabase
        .from('vendor_payouts')
        .select('*')
        .order('created_at', { ascending: false })

      // Earnings per vendor (orders * 0.88)
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('vendor_id, quantity, price, orders!inner(status)')
        .eq('orders.status', 'paid')

      const earningsByVendor = {}
      ;(itemsData || []).forEach((row) => {
        const vid = row.vendor_id
        if (!vid) return
        const gross = Number(row.price || 0) * (Number(row.quantity) || 1)
        const vendorShare = gross * 0.88
        earningsByVendor[vid] = (earningsByVendor[vid] || 0) + vendorShare
      })

      const paidByVendor = {}
      ;(payoutsData || []).forEach((p) => {
        if (p.status !== 'cancelled') {
          paidByVendor[p.vendor_id] = (paidByVendor[p.vendor_id] || 0) + Number(p.amount || 0)
        }
      })

      const balancesMap = {}
      vendors.forEach((v) => {
        const earned = earningsByVendor[v.id] || 0
        const paid = paidByVendor[v.id] || 0
        balancesMap[v.id] = {
          earned,
          paid,
          owed: Math.max(0, earned - paid),
          payout_method: payoutPrefs[v.application_id]?.payout_method || '',
          payout_email: payoutPrefs[v.application_id]?.payout_email || '',
        }
      })

      setVendors(vendors)
      setPayouts(payoutsData || [])
      setBalances(balancesMap)
      setLoading(false)
    }
    load()
  }, [])

  const handleCreatePayout = async (e) => {
    e.preventDefault()
    if (!supabase) return
    const vendorId = Number(form.vendorId) || 0
    const amount = Number(form.amount)
    if (!vendorId || !amount || amount <= 0) {
      alert('Selecciona un vendor y un monto válido.')
      return
    }
    try {
      setSaving(true)
      const now = new Date()
      const { data, error } = await supabase
        .from('vendor_payouts')
        .insert({
          vendor_id: vendorId,
          amount,
          status: 'paid',
          payment_method: form.paymentMethod || balances[vendorId]?.payout_method || '',
          payment_reference: form.paymentReference || '',
          notes: form.notes || '',
          period_start: filterFrom ? new Date(filterFrom).toISOString() : null,
          period_end: filterTo ? new Date(filterTo).toISOString() : null,
          paid_at: now.toISOString(),
        })
        .select('*')
        .single()
      if (error) throw error
      setPayouts((prev) => [data, ...prev])
      // Update balances locally
      setBalances((prev) => {
        const current = prev[vendorId] || { earned: 0, paid: 0, owed: 0 }
        const paid = current.paid + amount
        const owed = Math.max(0, current.earned - paid)
        return { ...prev, [vendorId]: { ...current, paid, owed } }
      })
      setForm({ vendorId: '', amount: '', paymentMethod: '', paymentReference: '', notes: '' })
      alert('Payout registrado.')
    } catch (err) {
      console.error('Error creating payout:', err)
      alert('No se pudo registrar el payout. Intenta más tarde.')
    } finally {
      setSaving(false)
    }
  }

  const filteredPayouts = payouts.filter((p) => {
    if (filterVendorId !== 'all' && String(p.vendor_id) !== String(filterVendorId)) return false
    if (filterFrom && new Date(p.created_at) < new Date(filterFrom)) return false
    if (filterTo && new Date(p.created_at) > new Date(filterTo)) return false
    return true
  })

  if (loading) return <div className="card p-6"><p className="text-neutral-600">Cargando payouts…</p></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-neutral-700 mb-1">Vendor payouts</h2>
          <p className="text-sm text-neutral-600">
            Track how much you owe each vendor, record payments, and keep a searchable history.
          </p>
        </div>
        <form onSubmit={handleCreatePayout} className="card p-4 flex flex-col md:flex-row gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Vendor</label>
            <select
              value={form.vendorId}
              onChange={(e) => {
                const vid = e.target.value
                setForm((f) => ({
                  ...f,
                  vendorId: vid,
                  amount: vid && balances[vid] ? balances[vid].owed.toFixed(2) : '',
                  paymentMethod: balances[vid]?.payout_method || '',
                }))
              }}
              className="input-field text-sm"
            >
              <option value="">Select vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.business_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="input-field text-sm w-28"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Payment method</label>
            <input
              type="text"
              value={form.paymentMethod}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              placeholder="PayPal, bank, Zelle…"
              className="input-field text-sm w-40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Reference</label>
            <input
              type="text"
              value={form.paymentReference}
              onChange={(e) => setForm((f) => ({ ...f, paymentReference: e.target.value }))}
              placeholder="Txn ID, memo…"
              className="input-field text-sm w-40"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Record payout'}
          </button>
        </form>
      </div>

      {/* Summary by vendor */}
      <div className="card p-4">
        <h3 className="font-semibold text-neutral-700 mb-3">Summary by vendor</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                <th className="py-2 pr-4">Vendor</th>
                <th className="py-2 pr-4">Preferred payout</th>
                <th className="py-2 pr-4 text-right">Earned (88%)</th>
                <th className="py-2 pr-4 text-right">Paid</th>
                <th className="py-2 pr-4 text-right">Owed</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => {
                const b = balances[v.id] || { earned: 0, paid: 0, owed: 0 }
                return (
                  <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 pr-4">
                      <p className="font-medium text-neutral-800">{v.business_name}</p>
                      <p className="text-xs text-neutral-500">{v.email}</p>
                    </td>
                    <td className="py-2 pr-4 text-xs text-neutral-600">
                      {b.payout_method || '—'}
                      {b.payout_email && (
                        <>
                          <br />
                          <span className="text-neutral-500">{b.payout_email}</span>
                        </>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right text-neutral-700">
                      ${b.earned.toFixed(2)}
                    </td>
                    <td className="py-2 pr-4 text-right text-neutral-700">
                      ${b.paid.toFixed(2)}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold text-sage">
                      ${b.owed.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <h3 className="font-semibold text-neutral-700">Payout history</h3>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Vendor</label>
              <select
                value={filterVendorId}
                onChange={(e) => setFilterVendorId(e.target.value)}
                className="input-field text-xs"
              >
                <option value="all">All vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">From</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">To</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>

        {filteredPayouts.length === 0 ? (
          <p className="text-sm text-neutral-500">No payout records for the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((p) => {
                  const vendor = vendors.find((v) => v.id === p.vendor_id)
                  return (
                    <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                      <td className="py-2 pr-4 text-xs text-neutral-600">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleString('es-PR')
                          : p.created_at
                          ? new Date(p.created_at).toLocaleString('es-PR')
                          : ''}
                      </td>
                      <td className="py-2 pr-4">
                        <p className="font-medium text-neutral-800 text-sm">
                          {vendor ? vendor.business_name : `Vendor #${p.vendor_id}`}
                        </p>
                      </td>
                      <td className="py-2 pr-4 text-right font-semibold text-neutral-800">
                        ${Number(p.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-2 pr-4 text-xs text-neutral-600">
                        {p.payment_method || '—'}
                      </td>
                      <td className="py-2 pr-4 text-xs text-neutral-600">
                        {p.payment_reference || '—'}
                      </td>
                      <td className="py-2 pr-4 text-xs text-neutral-600 max-w-xs truncate">
                        {p.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Service request status options
const SERVICE_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Services (Design Requests) View
function ServicesView() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadRequests = async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    loadRequests()
  }, [])

  const handleStatusChange = async (reqId, newStatus) => {
    if (!supabase || !reqId) return
    setActionLoading(reqId)
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', reqId)
    setActionLoading(null)
    if (error) {
      console.error('Error updating service request status:', error)
      alert('No se pudo actualizar el estado: ' + (error.message || 'Error'))
      return
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    )
  }

  const handleDelete = async (req) => {
    if (!supabase || !req?.id) return
    if (!confirm(`¿Eliminar la solicitud de ${req.service} #${req.reference}? Esta acción no se puede deshacer.`)) return
    setActionLoading(req.id)
    const { error } = await supabase.from('service_requests').delete().eq('id', req.id)
    setActionLoading(null)
    if (error) {
      console.error('Error deleting service request:', error)
      alert('No se pudo eliminar: ' + (error.message || 'Error'))
      return
    }
    setRequests((prev) => prev.filter((r) => r.id !== req.id))
  }

  if (loading) {
    return <div className="card p-6"><p className="text-neutral-600">Cargando solicitudes de servicios…</p></div>
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Service Requests</h2>
      {requests.length === 0 && (
        <p className="text-neutral-600">Aún no hay solicitudes de servicios.</p>
      )}
      <div className="space-y-4">
        {requests.map((req) => {
          const payload = req.payload || {}
          const contact = req.contact || {}
          const areas = payload.areas || []
          const status = req.status || 'new'
          const firstMedia = []
          areas.forEach((area) => {
            ;(area.entries || []).forEach((entry) => {
              ;(entry.media || []).forEach((m) => {
                if (m.dataUrl && firstMedia.length < 6) {
                  firstMedia.push(m.dataUrl)
                }
              })
            })
          })
          return (
            <div key={req.id} className="card p-4 border border-neutral-200">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium text-neutral-800">
                      {req.service} · <span className="text-xs text-neutral-500">#{req.reference}</span>
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : status === 'cancelled'
                          ? 'bg-neutral-200 text-neutral-600'
                          : status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sage/20 text-sage-dark'
                      }`}
                    >
                      {SERVICE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {contact.fullName || contact.name || 'Cliente'} · {contact.email || 'Sin email'}
                  </p>
                  {contact.phone && (
                    <p className="text-sm text-neutral-500">Tel: {contact.phone}</p>
                  )}
                  {contact.address && (
                    <p className="text-xs text-neutral-500 mt-1">{contact.address}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    Enviado: {req.created_at ? new Date(req.created_at).toLocaleString('es-PR') : '—'}
                  </p>
                  <p className="text-sm text-neutral-600 mt-2">
                    Subtotal: ${Number(req.subtotal || 0).toFixed(2)} · Depósito: ${Number(req.deposit || 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    disabled={!!actionLoading}
                    className="input-field text-sm py-2 pr-8 w-full sm:w-auto min-w-[140px]"
                  >
                    {SERVICE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(req)}
                    disabled={!!actionLoading}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar solicitud"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {areas.length > 0 && (
                <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-700 space-y-2">
                  <p className="font-medium">Spaces & details</p>
                  <ul className="space-y-1 text-xs text-neutral-600">
                    {areas.map((area) => (
                      <li key={area.id || area.label}>
                        <span className="font-semibold">{area.label}</span>
                        {Array.isArray(area.entries) && area.entries.length > 0 && (
                          <span>
                            {' '}
                            · {area.entries.length} espacio(s)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {firstMedia.length > 0 && (
                <div className="mt-3 border-t border-neutral-100 pt-3">
                  <p className="font-medium text-sm text-neutral-700 mb-2">Imágenes subidas</p>
                  <div className="flex flex-wrap gap-2">
                    {firstMedia.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => window.open(src, '_blank')}
                        className="block w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90"
                      >
                        <img src={src} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
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
                {app.phone && <p className="text-sm text-neutral-500">Tel: {app.phone}</p>}
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
                <p className="text-sm text-neutral-500">by {app.name} · {app.email}</p>
                {app.phone && <p className="text-sm text-neutral-500">Tel: {app.phone}</p>}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="w-[92vw] h-[92vh] max-w-5xl bg-white rounded-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200">
              <p className="text-sm text-neutral-600">Vendor image preview</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.open(previewImage, '_blank')}
                  className="text-xs text-sage hover:text-sage-dark underline underline-offset-2"
                >
                  Open full size
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-neutral-50 flex items-center justify-center">
              <img
                src={previewImage}
                alt="Vista previa"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reviews View – product_reviews from Supabase; approve awards 20 Magari Rewards pts
function ReviewsView() {
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [approvingId, setApprovingId] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setReviewsLoading(false)
      return
    }
    const load = async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setReviews(data || [])
      setReviewsLoading(false)
    }
    load()
  }, [])

  const handleApproveReview = async (reviewId) => {
    setApprovingId(reviewId)
    try {
      if (supabase) {
        await supabase
          .from('product_reviews')
          .update({ status: 'approved' })
          .eq('id', reviewId)
      }
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r))

      const res = await fetch('/.netlify/functions/rewards-award-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.ok && data.points) {
        alert(`Review approved. ${data.points} Magari Rewards points awarded to ${data.email || 'the reviewer'}.`)
      }
    } catch (err) {
      console.error('Approve review error:', err)
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectReview = async (reviewId) => {
    if (supabase) {
      await supabase
        .from('product_reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId)
    }
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  if (reviewsLoading) {
    return (
      <div>
        <h2 className="font-serif text-2xl text-neutral-700 mb-6">Review Moderation</h2>
        <p className="text-neutral-600">Loading reviews…</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Review Moderation</h2>
      <p className="text-sm text-neutral-600 mb-4">
        Approving a review awards 20 Magari Rewards points to the reviewer&apos;s email (if provided).
      </p>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-neutral-600">No product reviews yet.</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-neutral-700">{review.name}</p>
                  {review.email && (
                    <p className="text-xs text-neutral-500 mt-0.5">{review.email}</p>
                  )}
                  <div className="flex gap-1 my-1">
                    {[...Array(review.rating || 0)].map((_, i) => (
                      <span key={i} className="text-taupe">★</span>
                    ))}
                  </div>
                </div>
                <span className={`badge ${review.status === 'approved' ? 'badge-handmade' : review.status === 'rejected' ? 'bg-neutral-200 text-neutral-600' : 'bg-earth/20 text-earth-dark'}`}>
                  {review.status || 'pending'}
                </span>
              </div>

              <p className="text-neutral-600 mb-4">&quot;{review.text}&quot;</p>

              {(review.status === 'pending' || !review.status) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveReview(review.id)}
                    disabled={approvingId === review.id}
                    className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                  >
                    {approvingId === review.id ? 'Approving…' : 'Approve'}
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
          ))
        )}
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

