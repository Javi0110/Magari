import { useState } from 'react'
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
  Image as ImageIcon
} from 'lucide-react'
import { sampleProducts, sampleVendors, sampleTestimonials } from '../data/sampleData'
import { useProductsStore } from '../store/productsStore'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = (e) => {
    e.preventDefault()
    // 🔌 INTEGRATION: Admin authentication
    // Use Clerk with admin role, or custom JWT with admin flag
    // Check role/permissions before allowing access
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
                Authorized personnel only
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="admin@magariandco.com"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                Sign In
              </button>
            </form>

            <p className="text-xs text-neutral-500 mt-4 text-center">
              🔌 Placeholder login - any credentials work for demo
            </p>
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
          <button
            onClick={() => setIsLoggedIn(false)}
            className="btn-outline"
          >
            Logout
          </button>
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
        {activeTab === 'vendors' && <VendorsView />}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  )
}

// Dashboard View
function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$12,453', change: '+12.5%', color: 'turquoise' },
          { label: 'Orders', value: '156', change: '+8.2%', color: 'orange' },
          { label: 'Active Vendors', value: '12', change: '+3', color: 'lime' },
          { label: 'Products', value: '94', change: '+6', color: 'neutral-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <p className="text-neutral-600 text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.change} from last month</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-serif text-xl text-neutral-700 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                <div>
                  <p className="font-medium text-neutral-700">Order #{1000 + i}</p>
                  <p className="text-sm text-neutral-500">2 items · $125.00</p>
                </div>
                <span className="badge bg-taupe/20 text-taupe-dark">Completed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-serif text-xl text-neutral-700 mb-4">Pending Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-200">
              <p className="text-neutral-700">Vendor applications</p>
              <span className="badge bg-earth/20 text-earth-dark">2 pending</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-200">
              <p className="text-neutral-700">Reviews to moderate</p>
              <span className="badge bg-sage/20 text-sage-dark">5 pending</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-neutral-700">Low stock items</p>
              <span className="badge bg-neutral-200 text-neutral-700">3 items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Products View
function ProductsView() {
  const { products, getAllProducts, deleteProduct, getInventoryStats } = useProductsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      images: formData.images.split(',').map(img => img.trim()).filter(img => img),
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
                Image URLs (comma separated)
              </label>
              <input
                type="text"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="input-field"
                placeholder="/products/tray-1.jpg, /products/tray-2.jpg"
              />
              <p className="text-xs text-stone-light mt-1">
                Paths relative to /public folder (e.g., /products/image.jpg)
              </p>
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
  return (
    <div className="card p-6">
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Orders</h2>
      <p className="text-neutral-600">
        Order management coming soon. Integrate with your payment processor.
      </p>
      <p className="text-sm text-neutral-500 mt-2">
        🔌 Connect Stripe webhooks to /api/webhooks/stripe for real-time order updates
      </p>
    </div>
  )
}

// Vendors View
function VendorsView() {
  const [vendors, setVendors] = useState([
    ...sampleVendors.map(v => ({ ...v, status: 'approved' })),
    {
      id: 2,
      name: 'Ana',
      businessName: 'Ana\'s Textiles',
      email: 'ana@example.com',
      status: 'pending',
      appliedDate: '2025-10-28'
    }
  ])

  const handleApprove = (vendorId) => {
    setVendors(vendors.map(v => 
      v.id === vendorId ? { ...v, status: 'approved' } : v
    ))
    // 🔌 INTEGRATION: POST /api/vendors/:id/approve
    console.log('Approved vendor:', vendorId)
  }

  const handleReject = (vendorId) => {
    setVendors(vendors.filter(v => v.id !== vendorId))
    // 🔌 INTEGRATION: POST /api/vendors/:id/reject
    console.log('Rejected vendor:', vendorId)
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Vendors</h2>

      {/* Pending Applications */}
      <div className="mb-6">
        <h3 className="font-semibold text-neutral-700 mb-3">Pending Applications</h3>
        <div className="space-y-3">
          {vendors.filter(v => v.status === 'pending').map(vendor => (
            <div key={vendor.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">{vendor.businessName}</p>
                <p className="text-sm text-neutral-500">by {vendor.name} · Applied {vendor.appliedDate}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(vendor.id)}
                  className="btn-primary py-2 px-4 flex items-center text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(vendor.id)}
                  className="btn-outline py-2 px-4 flex items-center text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Vendors */}
      <div>
        <h3 className="font-semibold text-neutral-700 mb-3">Active Vendors</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {vendors.filter(v => v.status === 'approved').map(vendor => (
            <div key={vendor.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-neutral-700">{vendor.businessName}</h4>
                <span className="badge badge-handmade">Active</span>
              </div>
              <p className="text-sm text-neutral-600 mb-2">by {vendor.name}</p>
              {vendor.products && (
                <p className="text-xs text-neutral-500">
                  {vendor.products.length} products listed
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
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

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl text-neutral-700 mb-6">Settings</h2>

      <div className="space-y-6">
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

