import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Store, TrendingUp, Upload, DollarSign, Package, BarChart3, LogIn, UserPlus, MapPin, Edit, Trash2, Plus, Search, X, Image as ImageIcon, Trash2 as DeleteIcon, Bell } from 'lucide-react'
import { sendVendorApplicationEmail } from '../utils/emailService'
import { supabase } from '../utils/supabase'
import { sampleVendors } from '../data/sampleData'
import { useProductsStore } from '../store/productsStore'
import { useVendorProductsStore } from '../store/vendorProductsStore'
import { useNotificationsStore } from '../store/notificationsStore'

export default function MarketplacePage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const initialView = searchParams.get('view') === 'login' ? 'login' : 'landing'
  const [view, setView] = useState(initialView) // landing, apply, dashboard, login
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
  const [uploadedImages, setUploadedImages] = useState([])
  const [isDraggingImages, setIsDraggingImages] = useState(false)
  const [makers, setMakers] = useState([])
  const [makersLoading, setMakersLoading] = useState(false)

  // Handle image file uploads for vendor application
  const handleImageUpload = (files) => {
    const newImages = Array.from(files).slice(0, 6).map((file) => {
      if (file.type.startsWith('image/')) {
        const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const preview = URL.createObjectURL(file)
        return {
          id,
          file,
          preview,
          name: file.name
        }
      }
      return null
    }).filter(Boolean)
    
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 6))
  }
  
  const handleDropImages = (e) => {
    e.preventDefault()
    setIsDraggingImages(false)
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
    e.target.value = ''
  }
  
  const removeImage = (id) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image && image.preview) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleApplicationSubmit = async (e) => {
    e.preventDefault()
    
    const submittedAt = new Date().toISOString()
    const imageDataUrls = []
    for (const img of uploadedImages) {
      if (img?.file) {
        try {
          const dataUrl = await fileToDataUrl(img.file)
          imageDataUrls.push(dataUrl)
        } catch (err) {
          console.warn('Could not read image', err)
        }
      }
    }
    
    const applicationPayload = {
      ...applicationData,
      sampleImages: uploadedImages,
      submittedAt
    }
    
    if (supabase) {
      try {
        await supabase.from('vendor_applications').insert({
          name: applicationData.name,
          business_name: applicationData.businessName,
          email: applicationData.email,
          phone: applicationData.phone || '',
          instagram: applicationData.instagram || '',
          categories: applicationData.categories?.length ? applicationData.categories : [],
          bio: applicationData.bio || '',
          payout_method: applicationData.payoutMethod || 'paypal',
          payout_email: applicationData.payoutEmail,
          form_data: {
            ...applicationData,
            sampleImageCount: uploadedImages.length,
            sampleImages: imageDataUrls,
            submittedAt
          }
        })
      } catch (err) {
        console.error('Error saving application to Supabase:', err)
        alert('Error al enviar la solicitud. Intenta de nuevo.')
        return
      }
    } else {
      const existing = JSON.parse(localStorage.getItem('magari_vendor_applications') || '[]')
      localStorage.setItem('magari_vendor_applications', JSON.stringify([...existing, applicationPayload]))
    }
    
    try {
      await sendVendorApplicationEmail(applicationPayload)
    } catch (error) {
      console.error('Error sending email:', error)
    }
    
    alert('✓ Application submitted! We will review and get back to you within 3-5 business days.')
    setView('landing')
    
    setApplicationData({
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
    setUploadedImages([])
  }

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [loginError, setLoginError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const email = (loginData.email || '').trim()
    const code = (loginData.password || '').trim()
    if (!email || !code) {
      setLoginError('Introduce tu email y tu código de acceso.')
      return
    }
    if (supabase) {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, email, name, business_name, status')
        .eq('email', email)
        .eq('access_code', code)
        .eq('status', 'active')
        .limit(1)
      if (error || !vendors?.length) {
        setLoginError('Email o código de acceso incorrectos.')
        return
      }
      const vendor = vendors[0]
      setIsLoggedIn(true)
      setView('dashboard')
      const user = {
        email: vendor.email,
        vendorId: vendor.id,
        name: vendor.name,
        businessName: vendor.business_name,
        isMagariAccount: false,
        vendorSlug: (vendor.business_name || vendor.email).toLowerCase().replace(/[^a-z0-9]/g, '-')
      }
      setCurrentUser(user)
      localStorage.setItem('magari-current-user', JSON.stringify(user))
      return
    }
    const isMagariAccount = email.includes('magari') || email === 'magari@magariandco.com'
    setIsLoggedIn(true)
    setView('dashboard')
    const user = {
      email,
      isMagariAccount,
      vendorSlug: isMagariAccount ? 'magari' : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
    }
    setCurrentUser(user)
    localStorage.setItem('magari-current-user', JSON.stringify(user))
  }

  // Restaurar sesión de vendor si ya estaba logueado
  useEffect(() => {
    try {
      const raw = localStorage.getItem('magari-current-user')
      if (!raw) return
      const user = JSON.parse(raw)
      setCurrentUser(user)
      setIsLoggedIn(true)
      setView('dashboard')
    } catch {
      // ignore
    }
  }, [])

  // Cargar makers publicados desde Supabase para la sección "Meet Our Makers"
  useEffect(() => {
    const loadMakers = async () => {
      if (!supabase) return
      setMakersLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('id, business_name, name, profile_bio, profile_location, profile_instagram, published')
        .eq('status', 'active')
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setMakers(
          data.map(v => ({
            id: v.id,
            businessName: v.business_name,
            name: v.name,
            bio: v.profile_bio || '',
            location: v.profile_location || 'Puerto Rico',
            instagram: v.profile_instagram || '',
          }))
        )
      }
      setMakersLoading(false)
    }
    loadMakers()
  }, [])

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
                {makersLoading && makers.length === 0 && (
                  <p className="text-center text-neutral-500 col-span-full">Loading makers…</p>
                )}
                {!makersLoading && makers.length === 0 && (
                  <p className="text-center text-neutral-500 col-span-full">
                    Maker profiles will appear here once approved vendors publish their profile.
                  </p>
                )}
                {makers.map((vendor, index) => (
                  <div
                    key={vendor.id}
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sage font-medium">
                          Marketplace maker
                        </span>
                        {vendor.instagram && (
                          <a
                            href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-light hover:text-sage transition-colors"
                          >
                            {vendor.instagram}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </div>
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
                    Tell us about your business *
                  </label>
                  <textarea
                    required
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
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                      isDraggingImages ? 'border-sage bg-sage/10' : 'border-neutral-300 hover:border-sage'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDraggingImages(true)
                    }}
                    onDragLeave={() => setIsDraggingImages(false)}
                    onDrop={handleDropImages}
                  >
                    <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                    <p className="text-neutral-600 font-medium mb-2">
                      Arrastra y suelta imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-neutral-500">
                      PNG, JPG up to 5MB each. Máx 6 imágenes.
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="sample-images"
                    />
                    <label htmlFor="sample-images" className="cursor-pointer">
                      <span className="btn-outline inline-block mt-4">
                        Seleccionar imágenes
                      </span>
                    </label>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="relative rounded-xl overflow-hidden bg-neutral-100 group">
                          <img
                            src={img.preview}
                            alt={img.name || 'Product preview'}
                            className="w-full h-32 object-contain object-center"
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
                  {uploadedImages.length > 0 && (
                    <p className="text-xs text-neutral-500 mt-2">
                      {uploadedImages.length} imagen{uploadedImages.length !== 1 ? 'es' : ''} seleccionada{uploadedImages.length !== 1 ? 's' : ''}
                    </p>
                  )}
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
                {loginError && (
                  <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{loginError}</p>
                )}
                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="input-field"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Código de acceso
                  </label>
                  <input
                    type="text"
                    autoComplete="one-time-code"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="input-field"
                    placeholder="El código que recibiste por email"
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-3">
                  Entrar
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

function VendorOrdersTab({ vendorId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!vendorId)
  useEffect(() => {
    if (!supabase || !vendorId) {
      setLoading(false)
      return
    }
    supabase.from('order_items').select('id, product_title, quantity, price, order_id, created_at').eq('vendor_id', vendorId).order('created_at', { ascending: false }).limit(50)
      .then(async ({ data: itemsData }) => {
        const items = itemsData || []
        const orderIds = [...new Set(items.map(i => i.order_id).filter(Boolean))]
        let ordersMap = {}
        if (orderIds.length > 0) {
          const { data: ordersData } = await supabase.from('orders').select('id, customer_name, total, status').in('id', orderIds)
          ordersMap = (ordersData || []).reduce((acc, o) => ({ ...acc, [o.id]: o }), {})
        }
        setItems(items.map(i => ({ ...i, order: ordersMap[i.order_id] })))
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
  const [loading, setLoading] = useState(!!vendorId)
  useEffect(() => {
    if (!supabase || !vendorId) {
      setLoading(false)
      return
    }
    supabase.from('order_items').select('quantity, price').eq('vendor_id', vendorId)
      .then(({ data }) => {
        const items = data || []
        const productsSold = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
        const totalSales = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
        setStats({ totalSales, productsSold })
        setLoading(false)
      })
  }, [vendorId])
  const earnings = stats.totalSales * 0.88
  if (loading) return <div className="card p-8 text-center"><p className="text-neutral-600">Cargando…</p></div>
  return (
    <div className="grid md:grid-cols-3 gap-6">
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
function VendorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products')
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

// Vendor Profile Settings – controls what appears in "Meet Our Makers"
function VendorProfileSettings({ vendorId, currentUser }) {
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase || !vendorId) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('vendors')
        .select('profile_bio, profile_location, profile_website, profile_instagram, published')
        .eq('id', vendorId)
        .single()
      if (error) {
        console.error('Error loading vendor profile:', error)
        setError('Could not load your profile. Please try again later.')
      } else if (data) {
        setBio(data.profile_bio || '')
        setLocation(data.profile_location || '')
        setWebsite(data.profile_website || '')
        setInstagram(data.profile_instagram || '')
        setPublished(!!data.published)
      }
      setLoading(false)
    }
    loadProfile()
  }, [vendorId])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!supabase || !vendorId) return
    setSaving(true)
    const slugSource = currentUser?.businessName || currentUser?.email || ''
    try {
      const { error: updateErr } = await supabase
        .from('vendors')
        .update({
          profile_bio: bio,
          profile_location: location,
          profile_website: website,
          profile_instagram: instagram,
          published
        })
        .eq('id', vendorId)
      if (updateErr) throw updateErr
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

