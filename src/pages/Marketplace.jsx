import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Store, TrendingUp, Upload, DollarSign, Package, BarChart3, LogIn, UserPlus, MapPin, Edit, Trash2, Plus, Search, X, Image as ImageIcon } from 'lucide-react'
import { sampleVendors } from '../data/sampleData'
import { useProductsStore } from '../store/productsStore'
import { useVendorProductsStore } from '../store/vendorProductsStore'

export default function MarketplacePage() {
  const [view, setView] = useState('landing') // landing, apply, dashboard, login
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [applicationData, setApplicationData] = useState({
    name: '',
    businessName: '',
    instagram: '',
    email: '',
    phone: '',
    categories: [],
    bio: '',
    sampleImages: [],
    payoutMethod: 'paypal',
    payoutEmail: '',
  })

  const handleApplicationSubmit = (e) => {
    e.preventDefault()
    
    // 🔌 INTEGRATION: Submit to backend
    // POST /api/marketplace/apply
    // Store in database with status: 'pending'
    // Send confirmation email to applicant
    // Send notification email to admin
    
    console.log('Application submitted:', applicationData)
    alert('✓ Application submitted! We will review and get back to you within 3-5 business days.')
    setView('landing')
  }

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = (e) => {
    e.preventDefault()
    
    // 🔌 INTEGRATION: Authentication
    // Use Clerk, Supabase Auth, or custom JWT auth
    // POST /api/auth/login
    
    // For demo: check if email contains "magari" or "@magari" to determine account type
    const isMagariAccount = loginData.email.includes('magari') || loginData.email === 'magari@magariandco.com'
    
    console.log('Login attempt', { email: loginData.email, isMagariAccount })
    setIsLoggedIn(true)
    setView('dashboard')
    
    // Store user info in localStorage for demo
    localStorage.setItem('magari-current-user', JSON.stringify({
      email: loginData.email,
      isMagariAccount,
      vendorSlug: isMagariAccount ? 'magari' : loginData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
    }))
  }

  return (
    <div className="min-h-screen bg-cream py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {view === 'landing' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-0 -mt-2 md:-mt-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <img 
                  src="/momade-logo.png" 
                  alt="M&Made. MARKET" 
                  className="h-64 md:h-80 lg:h-96 mx-auto mb-0"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <h1 className="hidden font-serif text-5xl md:text-6xl text-sage-dark mb-4">
                  MOMade Marketplace
                </h1>
                <p className="text-xl md:text-2xl text-stone max-w-3xl mx-auto mb-6">
                  A curated shop supporting moms who make. 
                  <br />
                  Handcrafted with love, sold with purpose.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <button onClick={() => setView('apply')} className="btn-primary">
                    <Heart className="inline-block w-5 h-5 mr-2" />
                    Apply to Join
                  </button>
                  <button onClick={() => setView('login')} className="btn-outline">
                    <LogIn className="inline-block w-5 h-5 mr-2" />
                    Vendor Login
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Featured Vendors */}
            <div className="mt-10 md:mt-16 mb-20">
              <h2 className="font-serif text-4xl text-center text-neutral-600 mb-12">
                Meet Our Makers
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sampleVendors.map((vendor, index) => (
                  <Link
                    key={vendor.id}
                    to={`/maker/${vendor.slug}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="card hover:scale-105 transition-transform duration-300"
                    >
                      {/* Vendor Avatar Placeholder */}
                      <div className="w-20 h-20 rounded-full bg-sage-muted/20 mb-4" />
                      
                      <h3 className="font-serif text-2xl text-sage-dark mb-1">
                        {vendor.businessName}
                      </h3>
                      <p className="text-stone text-sm mb-1">
                        by {vendor.name}
                      </p>
                      <p className="text-stone-light text-xs mb-3 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vendor.location}
                      </p>
                      <p className="text-stone mb-4 line-clamp-3">
                        {vendor.bio}
                      </p>
                      
                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {vendor.categories.map(cat => (
                          <span key={cat} className="badge badge-maker">
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Product Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {vendor.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="aspect-square bg-greige-light rounded-lg" />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sage font-medium hover:underline">
                          View Shop →
                        </span>
                        <a
                          href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-stone-light hover:text-sage transition-colors"
                        >
                          {vendor.instagram}
                        </a>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-20">
              <h2 className="font-serif text-4xl text-center text-neutral-600 mb-12">
                How It Works
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <UserPlus className="w-8 h-8" />,
                    title: '1. Apply',
                    description: 'Submit your application with photos of your products. We review all applications within 3-5 business days.'
                  },
                  {
                    icon: <Upload className="w-8 h-8" />,
                    title: '2. List Products',
                    description: 'Once approved, upload your products with descriptions, photos, and pricing. You control your inventory.'
                  },
                  {
                    icon: <TrendingUp className="w-8 h-8" />,
                    title: '3. Earn & Grow',
                    description: 'We handle marketing and payments. You get 88% of each sale (12% platform fee). Payouts every 2 weeks.'
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center text-sage mx-auto mb-4">
                      {step.icon}
                    </div>
                    <h3 className="font-serif text-2xl text-neutral-700 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="card bg-gradient-to-br from-sage/10 to-taupe/10 p-12 text-center">
              <h2 className="font-serif text-4xl text-neutral-600 mb-8">
                Why Join MOMade?
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: <DollarSign />, text: 'Keep 88% of sales' },
                  { icon: <Store />, text: 'No setup fees' },
                  { icon: <TrendingUp />, text: 'Built-in audience' },
                  { icon: <Heart />, text: 'Community support' },
                ].map((benefit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sage mb-2">
                      {benefit.icon}
                    </div>
                    <p className="text-neutral-700 font-medium">{benefit.text}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setView('apply')} className="btn-primary">
                Apply Now
              </button>
            </div>
          </>
        )}

        {view === 'apply' && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setView('landing')}
              className="mb-6 text-neutral-600 hover:text-sage transition-colors"
            >
              ← Back to Marketplace
            </button>

            <div className="card p-8">
              <h2 className="font-serif text-4xl text-neutral-700 mb-2">
                Apply to Join
              </h2>
              <p className="text-neutral-600 mb-8">
                Tell us about your business and what you create. We typically review applications within 3-5 business days.
              </p>

              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationData.name}
                      onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                      className="input-field"
                      placeholder="María Rodriguez"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationData.businessName}
                      onChange={(e) => setApplicationData({ ...applicationData, businessName: e.target.value })}
                      className="input-field"
                      placeholder="María Ceramics"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicationData.email}
                      onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                      className="input-field"
                      placeholder="maria@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={applicationData.instagram}
                      onChange={(e) => setApplicationData({ ...applicationData, instagram: e.target.value })}
                      className="input-field"
                      placeholder="@maria_ceramics_pr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    className="input-field"
                    placeholder="(787) 555-0123"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Product Categories * (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Ceramics', 'Textiles', 'Jewelry', 'Home Decor', 'Art', 'Beauty', 'Food', 'Other'].map(cat => (
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applicationData.categories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setApplicationData({
                                ...applicationData,
                                categories: [...applicationData.categories, cat]
                              })
                            } else {
                              setApplicationData({
                                ...applicationData,
                                categories: applicationData.categories.filter(c => c !== cat)
                              })
                            }
                          }}
                          className="w-4 h-4 text-sage focus:ring-sage rounded"
                        />
                        <span className="ml-2 text-neutral-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Tell us about your business * (min 50 words)
                  </label>
                  <textarea
                    required
                    minLength={50}
                    value={applicationData.bio}
                    onChange={(e) => setApplicationData({ ...applicationData, bio: e.target.value })}
                    className="input-field min-h-32"
                    placeholder="What do you make? What's your story? What makes your products special?"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {applicationData.bio.split(' ').filter(w => w).length} words
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Sample Product Images * (3-6 images)
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:border-sage transition-colors">
                    <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                    <p className="text-neutral-600 font-medium mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-neutral-500">
                      PNG, JPG up to 5MB each
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="sample-images"
                    />
                    <label htmlFor="sample-images" className="cursor-pointer">
                      <span className="btn-outline inline-block mt-4">
                        Choose Files
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Payout Method *
                  </label>
                  <select
                    required
                    value={applicationData.payoutMethod}
                    onChange={(e) => setApplicationData({ ...applicationData, payoutMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer (ACH)</option>
                    <option value="stripe">Stripe Connect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Payout Email/Account *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicationData.payoutEmail}
                    onChange={(e) => setApplicationData({ ...applicationData, payoutEmail: e.target.value })}
                    className="input-field"
                    placeholder="paypal@example.com"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Payouts are processed every 2 weeks. You keep 88% of each sale.
                  </p>
                </div>

                <div className="bg-cream rounded-2xl p-6">
                  <h3 className="font-semibold text-neutral-700 mb-2">Commission Structure</h3>
                  <p className="text-neutral-600 text-sm mb-3">
                    Magari & Co. takes a 12% commission on each sale to cover payment processing, marketing, and platform maintenance.
                  </p>
                  <div className="text-sm space-y-1 text-neutral-600">
                    <p>Example: Product sells for $50</p>
                    <p>• Platform fee (12%): $6.00</p>
                    <p>• Your payout (88%): $44.00</p>
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary py-4">
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setView('landing')}
              className="mb-6 text-neutral-600 hover:text-sage transition-colors"
            >
              ← Back to Marketplace
            </button>

            <div className="card p-8">
              <h2 className="font-serif text-4xl text-neutral-700 mb-2">
                Vendor Login
              </h2>
              <p className="text-neutral-600 mb-8">
                Access your dashboard to manage products and view sales.
              </p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="input-field"
                    placeholder="maria@example.com"
                  />
                  <p className="text-xs text-stone-light mt-1">
                    Use email with "magari" for official Magari account
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-3">
                  Sign In
                </button>

                <p className="text-center text-sm text-neutral-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('apply')}
                    className="text-sage hover:underline"
                  >
                    Apply here
                  </button>
                </p>
              </form>
            </div>
          </div>
        )}

        {view === 'dashboard' && isLoggedIn && (
          <VendorDashboard 
            onLogout={() => { 
              setIsLoggedIn(false); 
              setView('landing');
              localStorage.removeItem('magari-current-user');
            }} 
          />
        )}
      </div>
    </div>
  )
}

// Vendor Dashboard Component
function VendorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products')
  const [activeSection, setActiveSection] = useState('marketplace') // 'magari-shop' or 'marketplace'
  const [currentUser, setCurrentUser] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formType, setFormType] = useState('marketplace') // 'magari-shop' or 'marketplace'

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('magari-current-user')
    if (stored) {
      setCurrentUser(JSON.parse(stored))
    }
  }, [])

  const isMagariAccount = currentUser?.isMagariAccount
  const vendorSlug = currentUser?.vendorSlug || 'default'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl text-sage-dark">
            {isMagariAccount ? 'Magari Admin Dashboard' : 'Vendor Dashboard'}
          </h1>
          <p className="text-stone mt-1">{currentUser?.email}</p>
        </div>
        <button onClick={onLogout} className="btn-outline">
          Logout
        </button>
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
        {['products', 'orders', 'analytics', 'settings'].map(tab => (
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <ProductsSection
          isMagariAccount={isMagariAccount}
          activeSection={activeSection}
          vendorSlug={vendorSlug}
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
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <VendorProductForm
          product={editingProduct}
          type={formType}
          vendorSlug={vendorSlug}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      {activeTab === 'orders' && (
        <div className="card p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-600">No orders yet. Your orders will appear here.</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-neutral-600 mb-2">Total Sales</p>
            <p className="text-4xl font-bold text-sage">$245</p>
            <p className="text-sm text-neutral-500 mt-1">Last 30 days</p>
          </div>
          <div className="card">
            <p className="text-neutral-600 mb-2">Products Sold</p>
            <p className="text-4xl font-bold text-earth">7</p>
            <p className="text-sm text-neutral-500 mt-1">Last 30 days</p>
          </div>
          <div className="card">
            <p className="text-neutral-600 mb-2">Your Earnings</p>
            <p className="text-4xl font-bold text-taupe">$215.60</p>
            <p className="text-sm text-neutral-500 mt-1">88% after fees</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card p-8">
          <h2 className="font-serif text-2xl text-neutral-700 mb-6">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-neutral-700 font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                defaultValue="María Ceramics"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-neutral-700 font-medium mb-2">
                Payout Method
              </label>
              <select className="input-field">
                <option>PayPal</option>
                <option>Bank Transfer</option>
                <option>Stripe Connect</option>
              </select>
            </div>
            <button className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Products Section Component
function ProductsSection({ isMagariAccount, activeSection, vendorSlug, onAddProduct, onEditProduct }) {
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

  const handleDelete = (product) => {
    if (confirm(`Delete "${product.title}"? This cannot be undone.`)) {
      if (isShowingMagariShop) {
        deleteProduct(product.id)
      } else {
        deleteVendorProduct(vendorSlug, product.id)
      }
    }
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

// Vendor Product Form Component
function VendorProductForm({ product, type, vendorSlug, onClose }) {
  const { addProduct, updateProduct } = useProductsStore()
  const { addVendorProduct, updateVendorProduct } = useVendorProductsStore()
  const isMagariShop = type === 'magari-shop'
  
  // Get vendor location from sampleVendors
  const vendor = !isMagariShop ? sampleVendors.find(v => v.slug === vendorSlug) : null
  const vendorLocation = vendor?.location || 'San Juan, PR'
  
  // Helper function to generate shipping info based on vendor location
  const generateShippingInfo = (location, shippingOptions) => {
    if (!location) return 'Ships from San Juan, PR to USA & PR'
    
    // Parse location (e.g., "San Juan, PR" or "New York, NY, USA")
    const locationParts = location.split(',').map(p => p.trim())
    const city = locationParts[0]
    const stateOrCountry = locationParts[1] || ''
    const country = locationParts[2] || (stateOrCountry.includes('PR') || stateOrCountry === 'PR' ? 'PR' : stateOrCountry)
    
    // Determine shipping destinations based on location
    let destinations = []
    if (location.includes('PR') || location.includes('Puerto Rico') || stateOrCountry === 'PR') {
      destinations = ['USA & PR']
    } else if (location.includes('USA') || location.includes('United States')) {
      destinations = ['USA']
    } else if (country && country !== 'PR' && !country.includes('PR')) {
      destinations = ['USA & International']
    } else {
      destinations = ['USA & PR']
    }
    
    // Build shipping info string
    let info = `Ships from ${city}`
    
    // Add state/country if different from city
    if (stateOrCountry && stateOrCountry !== city && !stateOrCountry.includes('PR')) {
      info += `, ${stateOrCountry}`
    }
    
    // Add country if different from state
    if (country && country !== stateOrCountry && country !== city && !country.includes('PR')) {
      info += `, ${country}`
    }
    
    // Add destinations
    if (destinations.length > 0) {
      info += ` to ${destinations.join(' & ')}`
    }
    
    return info
  }
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    price: product?.price || '',
    category: product?.category || (isMagariShop ? 'Handmade' : 'Ceramics'),
    room: product?.room || 'Any',
    description: product?.description || '',
    materials: product?.materials || '',
    dimensions: product?.dimensions || '',
    images: product?.images?.join(', ') || '',
    tags: product?.tags?.join(', ') || (isMagariShop ? 'magari' : 'maker'),
    shippingOptions: product?.shippingOptions || {
      delivery: false,
      pickup: false,
      shipping: false
    },
    shippingPrices: product?.shippingPrices || {
      delivery: 0,
      pickup: 0,
      shipping: 0
    },
    shipping: product?.shipping || generateShippingInfo(vendorLocation, product?.shippingOptions || { delivery: false, pickup: false, shipping: false }),
    returnPolicy: product?.returnPolicy || '30-day returns accepted',
    stock: product?.stock || 0,
    vendorName: product?.vendorName || '',
  })
  
  // Update shipping info when shipping options change
  const updateShippingInfo = (newShippingOptions) => {
    const newShippingInfo = generateShippingInfo(vendorLocation, newShippingOptions)
    setFormData(prev => ({
      ...prev,
      shipping: newShippingInfo
    }))
  }
  
  // Update shipping info on mount or when vendor changes (only if shipping info is default or missing)
  useEffect(() => {
    if (!product?.shipping || product.shipping === 'Ships from San Juan, PR to USA & PR') {
      const options = product?.shippingOptions || {
        delivery: false,
        pickup: false,
        shipping: false
      }
      const initialShippingInfo = generateShippingInfo(vendorLocation, options)
      setFormData(prev => ({
        ...prev,
        shipping: initialShippingInfo
      }))
    }
  }, [vendorLocation, product?.shipping, product?.shippingOptions])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      images: formData.images.split(',').map(img => img.trim()).filter(img => img),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      stock: isMagariShop ? undefined : parseInt(formData.stock) || 0,
      vendorName: isMagariShop ? undefined : (formData.vendorName || vendorSlug),
      shippingOptions: formData.shippingOptions,
      shippingPrices: {
        delivery: parseFloat(formData.shippingPrices.delivery) || 0,
        pickup: parseFloat(formData.shippingPrices.pickup) || 0,
        shipping: parseFloat(formData.shippingPrices.shipping) || 0,
      },
      shipping: formData.shipping, // Auto-generated based on vendor location
    }

    if (isMagariShop) {
      if (product) {
        updateProduct(product.id, productData)
      } else {
        addProduct(productData)
      }
    } else {
      if (product) {
        updateVendorProduct(vendorSlug, product.id, productData)
      } else {
        addVendorProduct(vendorSlug, productData)
      }
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
                      <option value="Handmade">Handmade</option>
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
              <div>
                <label className="block text-sage-dark font-medium mb-2">Room</label>
                <select
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

            {!isMagariShop && (
              <div className="grid md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sage-dark font-medium mb-2">Vendor/Business Name</label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            )}

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
              <label className="block text-sage-dark font-medium mb-2">Image URLs (comma separated)</label>
              <input
                type="text"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="input-field"
                placeholder="/products/image.jpg, /products/image-2.jpg"
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
                        updateShippingInfo(newOptions)
                      }}
                      className="w-4 h-4 text-sage focus:ring-sage"
                    />
                    <span className="text-sm font-medium text-neutral-700">Delivery</span>
                  </label>
                  {formData.shippingOptions?.delivery && (
                    <div className="flex-1">
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
                        updateShippingInfo(newOptions)
                      }}
                      className="w-4 h-4 text-sage focus:ring-sage"
                    />
                    <span className="text-sm font-medium text-neutral-700">Pickup</span>
                  </label>
                  {formData.shippingOptions?.pickup && (
                    <div className="flex-1">
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
                        updateShippingInfo(newOptions)
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

            {/* Shipping Info (Auto-generated) */}
            <div>
              <label className="block text-sage-dark font-medium mb-2">
                Shipping Info
                <span className="text-xs text-neutral-500 ml-2">(Auto-generated based on vendor location)</span>
              </label>
              <input
                type="text"
                value={formData.shipping}
                readOnly
                className="input-field bg-cream cursor-not-allowed"
                title="This field is automatically generated based on your vendor location"
              />
              {!isMagariShop && vendor && (
                <p className="text-xs text-neutral-500 mt-1">
                  Based on vendor location: {vendorLocation}
                </p>
              )}
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

