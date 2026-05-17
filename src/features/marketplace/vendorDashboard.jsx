import { useState, useEffect } from 'react'
import {
  Package,
  Upload,
  Edit,
  Trash2,
  Plus,
  Search,
  X,
  Image as ImageIcon,
  Bell,
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useProductsStore } from '../../store/productsStore'
import { useVendorProductsStore } from '../../store/vendorProductsStore'
import { useNotificationsStore } from '../../store/notificationsStore'
import { isLikelySupabaseProductId, rowToVendorProduct, vendorProductToDbRow } from '../../utils/marketplaceProductDb'
import { compressImageForUpload } from '../../utils/imageCompress'
import {
  vendorDeleteProduct,
  vendorGetProfile,
  vendorListOrderItems,
  vendorListPayouts,
  vendorSetPassword,
  vendorUpdateProfile,
  vendorUpsertProduct,
} from '../../lib/marketplace/vendorApi'
import { getVendorSecret } from '../../lib/marketplace/vendorSession'
function VendorOrdersTab({ vendorId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!vendorId)
  useEffect(() => {
    if (!vendorId) {
      setLoading(false)
      return
    }
    vendorListOrderItems(vendorId)
      .then((itemsData) => {
        setItems(itemsData || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setItems([])
        setLoading(false)
      })
  }, [vendorId])
  if (loading) return <div className="card p-8 text-center"><p className="text-neutral-600">Cargando…</p></div>
  if (items.length === 0) return (
    <div className="card p-8 text-center">
      <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
      <p className="text-neutral-600">No hay pedidos con tus productos aún.</p>
    </div>
  )
  return (
    <div className="card p-6">
      <h3 className="font-serif text-xl text-neutral-700 mb-4">Tus ventas</h3>
      <div className="space-y-3">
        {items.map(item => {
          const order = item.order
          return (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-neutral-200 last:border-0">
              <div>
                <p className="font-medium text-neutral-700">{item.product_title} × {item.quantity}</p>
                <p className="text-sm text-neutral-500">Pedido #{item.order_id}{order ? ` · ${order.customer_name}` : ''}</p>
              </div>
              <p className="font-medium text-sage">${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VendorAnalyticsTab({ vendorId }) {
  const [stats, setStats] = useState({ totalSales: 0, productsSold: 0 })
  const [payoutSummary, setPayoutSummary] = useState({ paid: 0, owed: 0 })
  const [loading, setLoading] = useState(!!vendorId)
  useEffect(() => {
    if (!supabase || !vendorId) {
      setLoading(false)
      return
    }
    const load = async () => {
      let items = []
      try {
        items = await vendorListOrderItems(vendorId)
      } catch (e) {
        console.error(e)
      }
      const productsSold = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
      const totalSales = items.reduce(
        (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
        0
      )
      setStats({ totalSales, productsSold })

      let payoutsData = []
      try {
        payoutsData = await vendorListPayouts(vendorId)
      } catch (e) {
        console.error(e)
      }
      const totalPaid = (payoutsData || [])
        .filter((p) => p.status !== 'cancelled')
        .reduce((s, p) => s + Number(p.amount || 0), 0)
      const earnings = totalSales * 0.88
      setPayoutSummary({
        paid: totalPaid,
        owed: Math.max(0, earnings - totalPaid),
      })
      setLoading(false)
    }
    load()
  }, [vendorId])
  const earnings = stats.totalSales * 0.88
  if (loading) return <div className="card p-8 text-center"><p className="text-neutral-600">Cargando…</p></div>
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="card">
        <p className="text-neutral-600 mb-2">Total Sales</p>
        <p className="text-4xl font-bold text-sage">${stats.totalSales.toFixed(2)}</p>
        <p className="text-sm text-neutral-500 mt-1">Desde el inicio</p>
      </div>
      <div className="card">
        <p className="text-neutral-600 mb-2">Products Sold</p>
        <p className="text-4xl font-bold text-earth">{stats.productsSold}</p>
        <p className="text-sm text-neutral-500 mt-1">Unidades vendidas</p>
      </div>
      <div className="card">
        <p className="text-neutral-600 mb-2">Your Earnings</p>
        <p className="text-4xl font-bold text-taupe">${earnings.toFixed(2)}</p>
        <p className="text-sm text-neutral-500 mt-1">88% después de comisión</p>
      </div>
      <div className="card">
        <p className="text-neutral-600 mb-2">Payout status</p>
        <p className="text-sm text-neutral-600">
          <span className="block">Paid: <span className="font-semibold text-neutral-800">${payoutSummary.paid.toFixed(2)}</span></span>
          <span className="block mt-1">Owed: <span className="font-semibold text-sage">${payoutSummary.owed.toFixed(2)}</span></span>
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          Payouts are processed manually by Magari. This view helps you track what has been recorded as paid.
        </p>
      </div>
    </div>
  )
}

function VendorNotificationsDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[400px] overflow-y-auto bg-white border border-greige-light rounded-xl shadow-lg z-50">
        <div className="p-3 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
          <span className="font-semibold text-neutral-700">Notificaciones</span>
          {notifications.some(n => !n.read) && (
            <button type="button" onClick={onMarkAllAsRead} className="text-sm text-sage hover:underline">
              Marcar todas leídas
            </button>
          )}
        </div>
        <div className="divide-y divide-neutral-100">
          {notifications.length === 0 && (
            <p className="p-4 text-neutral-500 text-sm">No hay notificaciones.</p>
          )}
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-3 text-left hover:bg-neutral-50 cursor-pointer ${!n.read ? 'bg-sage/5' : ''}`}
              onClick={() => { if (!n.read) onMarkAsRead(n.id) }}
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

// Vendor Dashboard Component
export function VendorDashboard({ onLogout, onMarketplaceProductsSynced }) {
  const [activeTab, setActiveTab] = useState('settings')
  const [activeSection, setActiveSection] = useState('marketplace')
  const [currentUser, setCurrentUser] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formType, setFormType] = useState('marketplace')
  const [showNotifications, setShowNotifications] = useState(false)
  const { items: notifications, unreadCount, fetchForVendor, markAsRead, markAllAsRead } = useNotificationsStore()

  useEffect(() => {
    const stored = localStorage.getItem('magari-current-user')
    if (stored) {
      setCurrentUser(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (currentUser?.vendorId) fetchForVendor(currentUser.vendorId)
  }, [currentUser?.vendorId, fetchForVendor])

  // Cargar productos del vendor desde Supabase al abrir el dashboard (y mantener borradores locales v-…)
  useEffect(() => {
    if (!supabase || !currentUser?.vendorId || currentUser?.isMagariAccount) return
    let cancelled = false
    const slug = currentUser.vendorSlug || 'default'
    const vid = currentUser.vendorId
    ;(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vid)
        .order('created_at', { ascending: false })
      if (cancelled || error) return
      const remote = (data || []).map(rowToVendorProduct)
      const { getVendorProducts, setVendorProductsList } = useVendorProductsStore.getState()
      const local = getVendorProducts(slug)
      const localsOnly = local.filter((p) => !isLikelySupabaseProductId(p.id))
      setVendorProductsList(slug, [...remote, ...localsOnly])
    })()
    return () => {
      cancelled = true
    }
  }, [currentUser?.vendorId, currentUser?.vendorSlug, currentUser?.isMagariAccount])

  const isMagariAccount = currentUser?.isMagariAccount
  const vendorSlug = currentUser?.vendorSlug || 'default'
  const isVendor = !!currentUser?.vendorId

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl text-sage-dark">
            {isMagariAccount ? 'Magari Admin Dashboard' : 'Vendor Dashboard'}
          </h1>
          <p className="text-stone mt-1">{currentUser?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {isVendor && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 border border-greige-light"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 text-stone" />
                <span className="font-medium text-stone hidden sm:inline">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-sage text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <VendorNotificationsDropdown
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={() => markAllAsRead('vendor', currentUser.vendorId)}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          )}
          <button onClick={onLogout} className="btn-outline">
            Logout
          </button>
        </div>
      </div>

      {/* Section Tabs (only for Magari account) */}
      {isMagariAccount && (
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['magari-shop', 'marketplace'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 rounded-2xl font-medium transition-colors whitespace-nowrap ${
                activeSection === section
                  ? 'text-white shadow-sm font-semibold'
                  : 'bg-white text-stone hover:bg-cream border border-greige-light'
              }`}
              style={activeSection === section ? { backgroundColor: '#2D3A2E' } : {}}
            >
              {section === 'magari-shop' ? 'Magari Shop Products' : 'MOMade Marketplace Products'}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['settings', 'products', 'orders', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-white shadow-sm font-semibold'
                : 'bg-white text-stone hover:bg-cream border border-greige-light'
            }`}
            style={activeTab === tab ? { backgroundColor: '#2D3A2E' } : {}}
          >
            {tab === 'settings'
              ? 'Profile'
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <ProductsSection
          isMagariAccount={isMagariAccount}
          activeSection={activeSection}
          vendorSlug={vendorSlug}
          vendorNumericId={currentUser?.vendorId}
          onAddProduct={(type) => {
            setFormType(type)
            setShowProductForm(true)
            setEditingProduct(null)
          }}
          onEditProduct={(product, type) => {
            setFormType(type)
            setEditingProduct(product)
            setShowProductForm(true)
          }}
          onMarketplaceProductsSynced={onMarketplaceProductsSynced}
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <VendorProductForm
          product={editingProduct}
          type={formType}
          vendorSlug={vendorSlug}
          vendorNumericId={currentUser?.vendorId}
          onMarketplaceProductsSynced={onMarketplaceProductsSynced}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      {activeTab === 'orders' && (
        <VendorOrdersTab vendorId={currentUser?.vendorId} />
      )}

      {activeTab === 'analytics' && (
        <VendorAnalyticsTab vendorId={currentUser?.vendorId} />
      )}

      {activeTab === 'settings' && (
        <VendorProfileSettings vendorId={currentUser?.vendorId} currentUser={currentUser} />
      )}
    </div>
  )
}

// Products Section Component
function ProductsSection({
  isMagariAccount,
  activeSection,
  vendorSlug,
  vendorNumericId,
  onAddProduct,
  onEditProduct,
  onMarketplaceProductsSynced,
}) {
  const { getAllProducts, deleteProduct, getInventoryStats } = useProductsStore()
  const { getVendorProducts, deleteVendorProduct, getVendorStats } = useVendorProductsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Determine which products to show
  const isShowingMagariShop = isMagariAccount && activeSection === 'magari-shop'
  
  let products = []
  let stats = {}
  let categories = []

  if (isShowingMagariShop) {
    // Show Magari Shop products
    const magariProducts = getAllProducts()
    products = magariProducts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    stats = getInventoryStats()
    categories = ['all', ...new Set(magariProducts.map(p => p.category))]
  } else {
    // Show Marketplace vendor products
    const vendorProducts = getVendorProducts(vendorSlug)
    products = vendorProducts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    stats = getVendorStats(vendorSlug)
    categories = ['all', ...new Set(vendorProducts.map(p => p.category))]
  }

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    if (isShowingMagariShop) {
      deleteProduct(product.id)
      return
    }
    if (vendorNumericId && isLikelySupabaseProductId(product.id)) {
      try {
        await vendorDeleteProduct(vendorNumericId, product.id)
        onMarketplaceProductsSynced?.()
      } catch (error) {
        console.error(error)
        alert(`Could not delete from database: ${error.message}`)
        return
      }
    }
    deleteVendorProduct(vendorSlug, product.id)
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-stone text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold text-sage">{stats.totalProducts || 0}</p>
        </div>
        <div className="card">
          <p className="text-stone text-sm mb-1">{isShowingMagariShop ? 'Inventory Value' : 'Stock Value'}</p>
          <p className="text-3xl font-bold text-earth">${(stats.totalValue || 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-stone text-sm mb-1">Categories</p>
          <p className="text-3xl font-bold text-taupe-dark">{Object.keys(stats.byCategory || {}).length}</p>
        </div>
        <div className="card">
          <p className="text-stone text-sm mb-1">{isShowingMagariShop ? 'Avg Price' : 'Total Stock'}</p>
          <p className="text-3xl font-bold text-stone">
            {isShowingMagariShop 
              ? `$${stats.totalProducts > 0 ? Math.round((stats.totalValue || 0) / stats.totalProducts) : 0}`
              : (stats.totalStock || 0)
            }
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <div className="flex gap-4 flex-1 w-full md:w-auto">
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
          onClick={() => onAddProduct(isShowingMagariShop ? 'magari-shop' : 'marketplace')}
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
              <th className="py-3 px-4 font-semibold text-sage-dark">Price</th>
              {!isShowingMagariShop && (
                <th className="py-3 px-4 font-semibold text-sage-dark">Stock</th>
              )}
              <th className="py-3 px-4 font-semibold text-sage-dark">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={isShowingMagariShop ? 4 : 5} className="py-12 text-center text-stone">
                  No products found
                </td>
              </tr>
            ) : (
              products.map(product => (
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
                  <td className="py-3 px-4 font-semibold text-sage">${product.price}</td>
                  {!isShowingMagariShop && (
                    <td className="py-3 px-4 text-stone text-sm">{product.stock || 0}</td>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditProduct(product, isShowingMagariShop ? 'magari-shop' : 'marketplace')}
                        className="text-sage hover:text-sage-dark transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
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
    </div>
  )
}

// Vendor Profile Settings – controls what appears in "Meet Our Makers"
function VendorProfileSettings({ vendorId, currentUser }) {
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }
      try {
        const data = await vendorGetProfile(vendorId)
        setBio(data.profile_bio || '')
        setLocation(data.profile_location || '')
        setWebsite(data.profile_website || '')
        setInstagram(data.profile_instagram || '')
        setAvatarDataUrl(data.profile_avatar_url || '')
        setPublished(!!data.published)
      } catch (err) {
        console.error('Error loading vendor profile:', err)
        setError('Could not load your profile. Log in again with your access code.')
      }
      setLoading(false)
    }
    loadProfile()
  }, [vendorId])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!vendorId) return
    setSaving(true)
    try {
      await vendorUpdateProfile(vendorId, {
        profile_bio: bio,
        profile_location: location,
        profile_website: website,
        profile_instagram: instagram,
        profile_avatar_url: avatarDataUrl,
        published,
      })
      setSuccess('Profile saved. Your maker card will show under “Meet Our Makers” when published is ON.')
    } catch (err) {
      console.error('Error saving vendor profile:', err)
      setError('Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!vendorId) {
    return (
      <div className="card p-8">
        <h2 className="font-serif text-2xl text-neutral-700 mb-4">Account Settings</h2>
        <p className="text-neutral-600 text-sm">
          This demo account cannot edit a public profile. Log in with a vendor account to manage your maker card.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-8">
        <p className="text-neutral-600">Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h2 className="font-serif text-2xl text-neutral-700 mb-2">Account Settings</h2>
      <p className="text-neutral-600 text-sm mb-6">
        This information appears on your public maker card in the “Meet Our Makers” section.
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-neutral-700 font-medium mb-2">Business name</label>
            <input
              type="text"
              value={currentUser?.businessName || ''}
              readOnly
              className="input-field bg-neutral-50"
            />
          </div>
          <div>
            <label className="block text-neutral-700 font-medium mb-2">Contact email</label>
            <input
              type="email"
              value={currentUser?.email || ''}
              readOnly
              className="input-field bg-neutral-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-700 font-medium mb-2">Short bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field"
            placeholder="Tell customers about your story, what you create, and what makes your brand special."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-neutral-700 font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="San Juan, PR"
            />
          </div>
          <div>
            <label className="block text-neutral-700 font-medium mb-2">Website (optional)</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="input-field"
              placeholder="https://yourshop.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-700 font-medium mb-2">Logo image</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-neutral-400 text-center px-2">No logo yet</span>
              )}
            </div>
            <label className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white cursor-pointer hover:bg-neutral-50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setAvatarDataUrl(reader.result)
                    }
                  }
                  reader.readAsDataURL(file)
                  e.target.value = ''
                }}
              />
              Upload logo
            </label>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            This logo will show as your profile photo in the “Meet Our Makers” grid.
          </p>
        </div>

        <div>
          <label className="block text-neutral-700 font-medium mb-2">Instagram handle (optional)</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="input-field"
            placeholder="@yourhandle"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-neutral-700 text-sm font-medium">
              Show my profile in the “Meet Our Makers” section
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-sage text-sm">{success}</p>}
      </form>

      {/* Password section */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <h3 className="font-serif text-xl text-neutral-700 mb-3">
          Vendor password
        </h3>
        <p className="text-neutral-600 text-sm mb-4">
          After you set a password, you can log in with your email and this password instead of the one‑time access code.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-neutral-700 font-medium mb-1 text-sm">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field text-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-neutral-700 font-medium mb-1 text-sm">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field text-sm"
              placeholder="Repeat password"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={passwordSaving || !newPassword || !confirmPassword}
          onClick={async () => {
            setPasswordMessage('')
            if (!vendorId) return
            if (newPassword !== confirmPassword) {
              setPasswordMessage('Passwords do not match.')
              return
            }
            if (newPassword.length < 6) {
              setPasswordMessage('Password should be at least 6 characters.')
              return
            }
            setPasswordSaving(true)
            try {
              const currentSecret = getVendorSecret()
              if (!currentSecret) {
                setPasswordMessage('Session expired. Log in again with your access code.')
                return
              }
              await vendorSetPassword(vendorId, currentSecret, newPassword)
              setPasswordMessage('Password saved. You can now log in using your email and this password.')
              setNewPassword('')
              setConfirmPassword('')
            } catch (e) {
              console.error(e)
              setPasswordMessage('Could not save password. Please try again.')
            } finally {
              setPasswordSaving(false)
            }
          }}
          className="btn-outline text-sm"
        >
          {passwordSaving ? 'Saving password…' : 'Save password'}
        </button>
        {passwordMessage && (
          <p className={`mt-2 text-sm ${passwordMessage.startsWith('Password saved') ? 'text-sage' : 'text-red-600'}`}>
            {passwordMessage}
          </p>
        )}
      </div>
    </div>
  )
}

// Vendor Product Form Component
function VendorProductForm({ product, type, vendorSlug, vendorNumericId, onMarketplaceProductsSynced, onClose }) {
  const { addProduct, updateProduct } = useProductsStore()
  const { addVendorProduct, updateVendorProduct, getVendorProducts, setVendorProductsList } = useVendorProductsStore()
  const isMagariShop = type === 'magari-shop'

  const parseShippingOptionsFromProduct = (p) => {
    let so = p?.shipping_options
    if (typeof so === 'string') {
      try {
        so = JSON.parse(so)
      } catch {
        so = {}
      }
    }
    return so && typeof so === 'object' ? so : {}
  }
  const soFromProduct = parseShippingOptionsFromProduct(product)
  
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
    category: product?.category || (isMagariShop ? 'Curated' : 'Ceramics'),
    description: product?.description || '',
    materials: product?.materials || '',
    dimensions: product?.dimensions || '',
    images: product?.images?.join(', ') || '',
    tags: product?.tags?.join(', ') || (isMagariShop ? 'magari' : 'maker'),
    shippingOptions: product?.shippingOptions || {
      delivery: !!soFromProduct.delivery,
      pickup: !!soFromProduct.pickup,
      shipping: !!soFromProduct.shipping,
    },
    shippingPrices: product?.shippingPrices || soFromProduct.prices || {
      delivery: 0,
      pickup: 0,
      shipping: 0
    },
    shipping:
      product?.shipping ||
      (isMagariShop ? 'Ships from San Juan, PR to USA & PR' : ''),
    pickupLocation: product?.pickupLocation ?? soFromProduct.pickupLocation ?? '',
    deliveryOriginAddress: product?.deliveryOriginAddress ?? soFromProduct.deliveryOriginAddress ?? '',
    deliveryRadiusMiles:
      product?.deliveryRadiusMiles ?? soFromProduct.deliveryRadiusMiles ?? '',
    returnPolicy: product?.returnPolicy || '30-day returns accepted',
    stock: product?.stock || 0,
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
        const file = await compressImageForUpload(img.file)
        const reader = new FileReader()
        const dataUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
        urls.push(dataUrl)
      }
    }
    return urls
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isMagariShop) {
      const opts = formData.shippingOptions || {}
      if (opts.delivery) {
        const miles = parseFloat(String(formData.deliveryRadiusMiles ?? '').replace(/,/g, ''))
        const pickupAddr = (formData.pickupLocation || '').trim()
        const deliverFrom = (formData.deliveryOriginAddress || '').trim()
        const originOk = opts.pickup ? pickupAddr.length >= 5 : deliverFrom.length >= 5
        if (!Number.isFinite(miles) || miles <= 0) {
          alert('If you offer delivery, enter a maximum delivery distance greater than 0 (miles).')
          return
        }
        if (!originOk) {
          alert(
            opts.pickup
              ? 'Enter a pickup address (at least 5 characters). That address is used to measure delivery distance.'
              : 'Enter the address you deliver from (at least 5 characters), or enable Pickup and enter a pickup address.'
          )
          return
        }
      }
      if (opts.pickup && (formData.pickupLocation || '').trim().length < 5) {
        alert('Enter where buyers can pick up the item (address or instructions, at least 5 characters).')
        return
      }
    }

    // Get image URLs from uploaded files
    const imageUrls = await getImageUrls()

    const shippingPrices = {
      delivery: parseFloat(formData.shippingPrices.delivery) || 0,
      pickup: parseFloat(formData.shippingPrices.pickup) || 0,
      shipping: parseFloat(formData.shippingPrices.shipping) || 0,
    }
    const deliveryRadiusNum =
      !isMagariShop && formData.shippingOptions?.delivery
        ? parseFloat(String(formData.deliveryRadiusMiles ?? '').replace(/,/g, '')) || 0
        : 0

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      images: imageUrls.length > 0 ? imageUrls : formData.images.split(',').map(img => img.trim()).filter(img => img),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      stock: isMagariShop ? undefined : parseInt(formData.stock) || 0,
      shippingOptions: formData.shippingOptions,
      shippingPrices,
      shipping: formData.shipping,
      pickupLocation: !isMagariShop ? (formData.pickupLocation || '').trim() : formData.pickupLocation,
      deliveryOriginAddress: !isMagariShop ? (formData.deliveryOriginAddress || '').trim() : formData.deliveryOriginAddress,
      deliveryRadiusMiles: !isMagariShop ? deliveryRadiusNum : undefined,
      shipping_options: !isMagariShop
        ? {
            ...formData.shippingOptions,
            prices: shippingPrices,
            pickupLocation: (formData.pickupLocation || '').trim(),
            deliveryOriginAddress: (formData.deliveryOriginAddress || '').trim(),
            deliveryRadiusMiles: deliveryRadiusNum,
          }
        : undefined,
    }

    if (isMagariShop) {
      if (product) {
        updateProduct(product.id, productData)
      } else {
        addProduct(productData)
      }
      onClose()
      return
    }

    // MOMade vendor: guardar en Supabase cuando hay sesión de vendor
    if (vendorNumericId) {
      try {
        const dbRow = vendorProductToDbRow(productData, vendorNumericId, vendorSlug)
        const row = await vendorUpsertProduct(
          vendorNumericId,
          dbRow,
          product && isLikelySupabaseProductId(product.id) ? product.id : null
        )
        const local = rowToVendorProduct(row)
        const prev = getVendorProducts(vendorSlug)
        const next = [
          local,
          ...prev.filter(
            (p) => String(p.id) !== String(product?.id) && String(p.id) !== String(local.id)
          ),
        ]
        setVendorProductsList(vendorSlug, next)
        onMarketplaceProductsSynced?.()
        onClose()
        return
      } catch (err) {
        console.error(err)
        const msg = String(err?.message || err || '')
        let hint =
          'Si el error menciona columnas o permisos, ejecuta supabase/APPLY_IN_DASHBOARD_ONE_FILE.sql en el SQL Editor de Supabase.'
        if (/quota/i.test(msg)) {
          hint =
            'Las fotos en base64 ocupan mucho en la base de datos. Ya reducimos tamaño al guardar; prueba con menos imágenes o fotos más pequeñas. En Supabase revisa cuota de base de datos/archivos del plan, o usa URLs de imágenes (campo separado por comas) en lugar de subir muchos archivos grandes.'
        }
        alert(`No se pudo guardar en Supabase: ${msg}\n\n${hint}`)
        return
      }
    }

    if (product) {
      updateVendorProduct(vendorSlug, product.id, productData)
    } else {
      addVendorProduct(vendorSlug, productData)
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
              {product ? 'Edit Product' : `Add ${isMagariShop ? 'Magari Shop' : 'Marketplace'} Product`}
            </h2>
            <button onClick={onClose} className="text-stone hover:text-sage-dark">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sage-dark font-medium mb-2">Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {isMagariShop ? (
                    <>
                      <option value="Elementos Collection">Elementos Collection</option>
                      <option value="Curated">Curated</option>
                      <option value="Bundles">Bundles</option>
                    </>
                  ) : (
                    <>
                      <option value="Ceramics">Ceramics</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Art">Art</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>
              {!isMagariShop && (
                <div>
                  <label className="block text-sage-dark font-medium mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sage-dark font-medium mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sage-dark font-medium mb-2">Materials</label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sage-dark font-medium mb-2">Dimensions</label>
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
                  JPG, PNG o WEBP. Se optimizan automáticamente al guardar (máx. ~1600px) para no superar la cuota de
                  Supabase. Evita muchas fotos enormes en un solo producto.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="product-images-upload"
                />
                <label
                  htmlFor="product-images-upload"
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
              <label className="block text-sage-dark font-medium mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Shipping Options & Prices */}
            <div>
              <label className="block text-sage-dark font-medium mb-3">Shipping Options & Prices</label>
              <div className="space-y-4">
                {/* Delivery */}
                <div className="flex items-start gap-4 p-4 bg-cream rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.shippingOptions?.delivery || false}
                      onChange={(e) => {
                        const newOptions = {
                          ...formData.shippingOptions,
                          delivery: e.target.checked
                        }
                        setFormData({
                          ...formData,
                          shippingOptions: newOptions
                        })
                      }}
                      className="w-4 h-4 text-sage focus:ring-sage"
                    />
                    <span className="text-sm font-medium text-neutral-700">Delivery</span>
                  </label>
                  {formData.shippingOptions?.delivery && (
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">Delivery Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.shippingPrices?.delivery || 0}
                          onChange={(e) => setFormData({
                            ...formData,
                            shippingPrices: {
                              ...formData.shippingPrices,
                              delivery: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      {!isMagariShop && (
                        <>
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">Max delivery distance (miles) *</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={formData.deliveryRadiusMiles}
                              onChange={(e) => setFormData({ ...formData, deliveryRadiusMiles: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                              placeholder="e.g. 15"
                            />
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Checkout allows delivery only if the buyer&apos;s address is within this radius of your pickup or delivery origin.
                            </p>
                          </div>
                          {!formData.shippingOptions?.pickup && (
                            <div>
                              <label className="block text-xs text-neutral-600 mb-1">Deliver from (full address) *</label>
                              <input
                                type="text"
                                value={formData.deliveryOriginAddress}
                                onChange={(e) => setFormData({ ...formData, deliveryOriginAddress: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                                placeholder="Street, city, state, ZIP"
                              />
                              <p className="text-[11px] text-neutral-500 mt-1">
                                Used to measure distance. If you enable Pickup below, the pickup address is used instead.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Pickup */}
                <div className="flex items-start gap-4 p-4 bg-cream rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.shippingOptions?.pickup || false}
                      onChange={(e) => {
                        const newOptions = {
                          ...formData.shippingOptions,
                          pickup: e.target.checked
                        }
                        setFormData({
                          ...formData,
                          shippingOptions: newOptions
                        })
                      }}
                      className="w-4 h-4 text-sage focus:ring-sage"
                    />
                    <span className="text-sm font-medium text-neutral-700">Pickup</span>
                  </label>
                  {formData.shippingOptions?.pickup && (
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">Pickup Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.shippingPrices?.pickup || 0}
                          onChange={(e) => setFormData({
                            ...formData,
                            shippingPrices: {
                              ...formData.shippingPrices,
                              pickup: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      {!isMagariShop && (
                        <div>
                          <label className="block text-xs text-neutral-600 mb-1">Pickup location *</label>
                          <input
                            type="text"
                            value={formData.pickupLocation}
                            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                            placeholder="Address or instructions for buyers"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping */}
                <div className="flex items-start gap-4 p-4 bg-cream rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.shippingOptions?.shipping || false}
                      onChange={(e) => {
                        const newOptions = {
                          ...formData.shippingOptions,
                          shipping: e.target.checked
                        }
                        setFormData({
                          ...formData,
                          shippingOptions: newOptions
                        })
                      }}
                      className="w-4 h-4 text-sage focus:ring-sage"
                    />
                    <span className="text-sm font-medium text-neutral-700">Shipping</span>
                  </label>
                  {formData.shippingOptions?.shipping && (
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-600 mb-1">Shipping Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.shippingPrices?.shipping || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingPrices: {
                            ...formData.shippingPrices,
                            shipping: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Info — vendors edit freely (shown on product / shop) */}
            <div>
              <label className="block text-sage-dark font-medium mb-2">Shipping Info</label>
              <input
                type="text"
                value={formData.shipping}
                onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                className="input-field"
                placeholder='e.g. Ships from Austin, TX to USA'
              />
              <p className="text-xs text-neutral-500 mt-1">
                Describe where the item ships from and where you send to (buyers see this on the product).
              </p>
            </div>

            {/* Return Policy Dropdown */}
            <div>
              <label className="block text-sage-dark font-medium mb-2">Return Policy *</label>
              <select
                required
                value={formData.returnPolicy}
                onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                className="input-field"
              >
                <option value="">Select return policy...</option>
                <option value="30-day returns accepted">30-day returns accepted</option>
                <option value="14-day returns accepted">14-day returns accepted</option>
                <option value="7-day returns accepted">7-day returns accepted</option>
                <option value="No returns accepted">No returns accepted</option>
                <option value="Exchanges only">Exchanges only</option>
                <option value="Store credit only">Store credit only</option>
                <option value="Custom policy (contact vendor)">Custom policy (contact vendor)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-cream-dark">
              <button type="button" onClick={onClose} className="flex-1 btn-outline">
                Cancel
              </button>
              <button type="submit" className="flex-1 btn-primary">
                {product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

