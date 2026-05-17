import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Store, TrendingUp, Upload, DollarSign, LogIn, UserPlus, MapPin, Search, X, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { sendVendorApplicationEmail } from '../../utils/emailService'
import { supabase } from '../../utils/supabase'
import InlineSelect from '../../components/InlineSelect'
import { useCartStore } from '../../store/cartStore'
import { normalizeMarketplaceProductForCart } from '../../utils/fulfillment'
import { verifyVendorLogin } from '../../lib/marketplace/vendorApi'
import {
  clearVendorSession,
  loadVendorSession,
  saveVendorSession,
} from '../../lib/marketplace/vendorSession'
import InstagramDmCta from '../../components/InstagramDmCta'
import PageBottomCta from '../../components/PageBottomCta'
import { VendorDashboard } from './vendorDashboard'

export default function MarketplacePage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const path = location.pathname
  let initialView = 'landing'
  if (path.includes('vendor-login')) {
    initialView = 'login'
  } else if (path.includes('become-a-vendor')) {
    initialView = 'apply'
  } else if (searchParams.get('view') === 'login') {
    initialView = 'login'
  }
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
  const [marketplaceProducts, setMarketplaceProducts] = useState([])
  const [marketplaceLoading, setMarketplaceLoading] = useState(false)
  const [marketplaceError, setMarketplaceError] = useState('')
  const [shopSearch, setShopSearch] = useState('')
  const [shopCategory, setShopCategory] = useState('all')
  const [shopMakerId, setShopMakerId] = useState('all')
  const [shopDisplayCount, setShopDisplayCount] = useState(12)
  const [selectedMarketplaceProduct, setSelectedMarketplaceProduct] = useState(null)
  const [marketplaceDetailImageIndex, setMarketplaceDetailImageIndex] = useState(0)
  const shopRef = useRef(null)
  const { addItem: addToCart } = useCartStore()

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
      try {
        const vendor = await verifyVendorLogin(email, code)
        if (!vendor) {
          setLoginError('Email o código de acceso incorrectos.')
          return
        }
        setIsLoggedIn(true)
        setView('dashboard')
        const user = {
          email: vendor.email,
          vendorId: vendor.id,
          name: vendor.name,
          businessName: vendor.business_name,
          isMagariAccount: false,
          vendorSlug: (vendor.business_name || vendor.email).toLowerCase().replace(/[^a-z0-9]/g, '-'),
        }
        saveVendorSession(user, code)
        return
      } catch (err) {
        console.error(err)
        setLoginError('Email o código de acceso incorrectos.')
        return
      }
    }
    const normalized = (email || '').toLowerCase().trim()
    const isMagariAccount =
      normalized === 'magaribyelena@gmail.com' ||
      normalized === 'magari@magariandco.com' ||
      normalized === 'magari@casamagari.com' ||
      email.includes('magari')
    setIsLoggedIn(true)
    setView('dashboard')
    const user = {
      email,
      isMagariAccount,
      vendorSlug: isMagariAccount ? 'magari' : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
    }
    localStorage.setItem('magari-current-user', JSON.stringify(user))
  }

  // Cambiar entre landing/login/apply según la URL
  useEffect(() => {
    // Si el vendor está en su dashboard y sigue en la ruta de login,
    // no forzamos cambio de vista. Pero si navega a /momade desde el header,
    // sí permitimos volver a la landing del marketplace.
    if (view === 'dashboard' && location.pathname.includes('vendor-login')) return
    const params = new URLSearchParams(location.search)
    const v = params.get('view')
    const pathname = location.pathname
    if (pathname.includes('vendor-login') || v === 'login') {
      setView('login')
    } else if (pathname.includes('become-a-vendor')) {
      setView('apply')
    } else {
      setView('landing')
    }
    // view omitted: keep dashboard on vendor-login without resetting on pathname-only updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  // Si la ruta es /momade/shop, hacer scroll al área de productos al cargar
  useEffect(() => {
    if (location.pathname === '/momade/shop' || location.pathname === '/marketplace/shop') {
      // Esperar un tick para que el DOM tenga el ref listo
      setTimeout(() => {
        if (shopRef.current) {
          shopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [location.pathname])

  // Restaurar sesión de vendor si ya estaba logueado
  useEffect(() => {
    try {
      const { user } = loadVendorSession()
      if (!user) return
      setIsLoggedIn(true)
      // Solo mostramos el dashboard automáticamente si el vendor
      // está explícitamente en la ruta de login.
      if (location.pathname.includes('vendor-login')) {
        setView('dashboard')
      }
    } catch {
      // ignore
    }
  }, [location.pathname])

  // Cargar makers publicados desde Supabase para la sección "Meet Our Makers"
  useEffect(() => {
    const loadMakers = async () => {
      if (!supabase) return
      setMakersLoading(true)
      let { data, error } = await supabase
        .from('vendors_public')
        .select('id, business_name, name, profile_bio, profile_location, profile_instagram, profile_avatar_url, published')
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (error && error.code === '42P01') {
        const fallback = await supabase
          .from('vendors')
          .select('id, business_name, name, profile_bio, profile_location, profile_instagram, profile_avatar_url, published')
          .eq('status', 'active')
          .eq('published', true)
          .order('created_at', { ascending: false })
        data = fallback.data
        error = fallback.error
      }
      if (error) {
        console.error('Error loading makers:', error)
      }
      if (!error && data) {
        setMakers(
          data.map(v => {
            const fallbackSlug = (v.business_name || '')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
            return {
              id: v.id,
              slug: v.slug || fallbackSlug,
              businessName: v.business_name,
              name: v.name,
              bio: v.profile_bio || '',
              location: v.profile_location || 'Puerto Rico',
              instagram: v.profile_instagram || '',
              avatarUrl: v.profile_avatar_url || '',
            }
          })
        )
      }
      setMakersLoading(false)
    }
    loadMakers()
  }, [])

  const refreshMarketplaceProducts = useCallback(async () => {
    if (!supabase) return
    setMarketplaceLoading(true)
    setMarketplaceError('')
    let { data, error } = await supabase
      .from('products')
      .select('id, title, price, category, images, description, stock, vendor_id, created_at, shipping_options, shipping')
      .not('vendor_id', 'is', null)
      .order('created_at', { ascending: false })
    if (error) {
      const fb = await supabase
        .from('products')
        .select('*')
        .not('vendor_id', 'is', null)
        .order('created_at', { ascending: false })
      data = fb.data
      error = fb.error
    }
    if (error) {
      console.error('Error loading marketplace products:', error)
      setMarketplaceError('Could not load marketplace products. Please try again later.')
      setMarketplaceProducts([])
    } else {
      setMarketplaceProducts(data || [])
    }
    setMarketplaceLoading(false)
  }, [])

  useEffect(() => {
    refreshMarketplaceProducts()
  }, [refreshMarketplaceProducts])

  // Map makers by id for quick lookup
  const makersById = useMemo(() => {
    const map = {}
    makers.forEach(m => {
      map[m.id] = m
    })
    return map
  }, [makers])

  const filteredMarketplaceProducts = useMemo(() => {
    let items = [...marketplaceProducts]
    if (shopSearch) {
      const q = shopSearch.toLowerCase()
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    }
    if (shopCategory !== 'all') {
      items = items.filter(p => p.category === shopCategory)
    }
    if (shopMakerId !== 'all') {
      items = items.filter(p => String(p.vendor_id) === String(shopMakerId))
    }
    return items
  }, [marketplaceProducts, shopSearch, shopCategory, shopMakerId])

  const displayedMarketplaceProducts = filteredMarketplaceProducts.slice(0, shopDisplayCount)
  const hasMoreMarketplace = shopDisplayCount < filteredMarketplaceProducts.length

  const handleShopAddToCart = (product) => {
    addToCart(normalizeMarketplaceProductForCart(product))
  }

  const scrollToShop = () => {
    if (shopRef.current) {
      shopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-cream py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {view === 'landing' && (
          <>
            {/* Hero Section – curated marketplace intro */}
            <div className="text-center py-4 md:py-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <img 
                  src="/momade-logo.png" 
                  alt="M&Made. MARKET" 
                  className="h-44 md:h-56 lg:h-60 mx-auto mb-3"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <h1 className="hidden font-serif text-5xl md:text-6xl text-sage-dark mb-4">
                  MOMade Marketplace
                </h1>
                <p className="text-xl md:text-2xl text-stone max-w-3xl mx-auto mb-6">
                  Ceramics, textiles, paper goods, gifts — all from mom-owned brands.
                  <br />
                  We curate for quality and story; you shop like a design studio, not a flea scroll.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 flex-wrap">
                  <button onClick={scrollToShop} className="btn-primary">
                    <ShoppingBag className="inline-block w-5 h-5 mr-2" />
                    Shop all MOMade
                  </button>
                  <button onClick={() => setView('apply')} className="btn-outline">
                    <Heart className="inline-block w-5 h-5 mr-2" />
                    Apply to Join
                  </button>
                  <button onClick={() => setView('login')} className="btn-outline">
                    <LogIn className="inline-block w-5 h-5 mr-2" />
                    Vendor Login
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4 flex-wrap">
                  <Link to="/contact#book" className="btn-outline btn-sm">
                    Book Magari services
                  </Link>
                  <InstagramDmCta className="btn-outline btn-sm" />
                </div>
              </motion.div>
            </div>

            {/* Marketplace Shop Section – shop by category & filters */}
            <div ref={shopRef} className="mt-6 md:mt-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-serif text-3xl md:text-4xl text-neutral-700">
                    Shop the MOMade Marketplace
                  </h2>
                  <p className="text-neutral-600 mt-2">
                    Browse by maker or shop by product type to find ceramics, textiles, art, stationery, gifts and more.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search products…"
                      value={shopSearch}
                      onChange={(e) => {
                        setShopSearch(e.target.value)
                        setShopDisplayCount(12)
                      }}
                      className="input-field pl-9"
                    />
                  </div>
                  <InlineSelect
                    value={shopMakerId}
                    onChange={(val) => {
                      setShopMakerId(val)
                      setShopDisplayCount(12)
                    }}
                    options={[
                      { value: 'all', label: 'All makers' },
                      ...makers.map((m) => ({
                        value: String(m.id),
                        label: m.businessName,
                      })),
                    ]}
                    className="w-full sm:w-48"
                    placeholder="All makers"
                  />
                  <InlineSelect
                    value={shopCategory}
                    onChange={(val) => {
                      setShopCategory(val)
                      setShopDisplayCount(12)
                    }}
                    options={[
                      { value: 'all', label: 'All categories' },
                      { value: 'Ceramics', label: 'Ceramics' },
                      { value: 'Textiles', label: 'Textiles' },
                      { value: 'Home Decor', label: 'Home Decor' },
                      { value: 'Art', label: 'Art & Prints' },
                      { value: 'Stationery', label: 'Stationery & Paper Goods' },
                      { value: 'Jewelry', label: 'Jewelry' },
                      { value: 'Gifts', label: 'Gifts' },
                      { value: 'Beauty', label: 'Self-care & Beauty' },
                      { value: 'Food', label: 'Pantry & Treats' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    className="w-full sm:w-40"
                    placeholder="All categories"
                  />
                </div>
              </div>

              {marketplaceLoading && marketplaceProducts.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="text-neutral-600">Loading products…</p>
                </div>
              )}

              {marketplaceError && (
                <div className="card p-4 mb-4 bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  {marketplaceError}
                </div>
              )}

              {!marketplaceLoading && !marketplaceError && displayedMarketplaceProducts.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="text-neutral-600 mb-2">No products found for your filters.</p>
                  <button
                    onClick={() => {
                      setShopSearch('')
                      setShopCategory('all')
                      setShopMakerId('all')
                      setShopDisplayCount(12)
                    }}
                    className="btn-outline text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {displayedMarketplaceProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedMarketplaceProducts.map(product => {
                      const maker = makersById[product.vendor_id]
                      return (
                        <div
                          key={product.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedMarketplaceProduct(product)
                            setMarketplaceDetailImageIndex(0)
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMarketplaceProduct(product); setMarketplaceDetailImageIndex(0); } }}
                          className="card hover:shadow-soft-lg transition-all duration-200 flex flex-col cursor-pointer"
                        >
                          <div className="relative aspect-square bg-neutral-100 rounded-2xl mb-4 overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                                Product image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h3 className="font-serif text-xl text-neutral-800 mb-1">
                              {product.title}
                            </h3>
                            {maker && (
                              <p className="text-xs text-neutral-500 mb-1">
                                by {maker.businessName}
                              </p>
                            )}
                            <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                              {product.description}
                            </p>
                            <p className="text-lg font-semibold text-sage mb-4">
                              ${Number(product.price).toFixed(2)}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShopAddToCart(product); }}
                              disabled={(product.stock || 0) === 0}
                              className="w-full btn-primary py-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {(product.stock || 0) === 0 ? 'Sold Out' : 'Add to cart'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Marketplace product detail modal */}
                  <AnimatePresence>
                    {selectedMarketplaceProduct && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedMarketplaceProduct(null)}
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col"
                        >
                          <button
                            onClick={() => setSelectedMarketplaceProduct(null)}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-neutral-500 hover:text-neutral-700"
                            aria-label="Close"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <div className="overflow-y-auto flex-1">
                            <div className="relative bg-neutral-100">
                              <div className="aspect-square max-h-[45vh] flex items-center justify-center overflow-hidden">
                                {Array.isArray(selectedMarketplaceProduct.images) && selectedMarketplaceProduct.images.length > 0 ? (
                                  <>
                                    <img
                                      src={selectedMarketplaceProduct.images[marketplaceDetailImageIndex] || selectedMarketplaceProduct.images[0]}
                                      alt={selectedMarketplaceProduct.title}
                                      className="w-full h-full object-contain"
                                    />
                                    {selectedMarketplaceProduct.images.length > 1 && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setMarketplaceDetailImageIndex((i) => (i <= 0 ? selectedMarketplaceProduct.images.length - 1 : i - 1)); }}
                                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-neutral-700 hover:bg-white shadow"
                                          aria-label="Previous image"
                                        >
                                          <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setMarketplaceDetailImageIndex((i) => (i >= selectedMarketplaceProduct.images.length - 1 ? 0 : i + 1)); }}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-neutral-700 hover:bg-white shadow"
                                          aria-label="Next image"
                                        >
                                          <ChevronRight className="w-5 h-5" />
                                        </button>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-neutral-400 text-sm">No image</div>
                                )}
                              </div>
                              {Array.isArray(selectedMarketplaceProduct.images) && selectedMarketplaceProduct.images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto justify-center border-t border-neutral-200">
                                  {selectedMarketplaceProduct.images.map((img, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setMarketplaceDetailImageIndex(i); }}
                                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === marketplaceDetailImageIndex ? 'border-sage ring-1 ring-sage' : 'border-transparent hover:border-neutral-300'}`}
                                    >
                                      <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="p-6 md:p-8">
                              {selectedMarketplaceProduct.category && (
                                <p className="text-xs font-medium text-sage-dark uppercase tracking-wide mb-1">{selectedMarketplaceProduct.category}</p>
                              )}
                              {makersById[selectedMarketplaceProduct.vendor_id] && (
                                <p className="text-sm text-neutral-500 mb-1">by {makersById[selectedMarketplaceProduct.vendor_id].businessName}</p>
                              )}
                              <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-2">
                                {selectedMarketplaceProduct.title}
                              </h2>
                              <p className="text-2xl font-semibold text-sage mb-4">
                                ${Number(selectedMarketplaceProduct.price).toFixed(2)}
                              </p>
                              <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                                {selectedMarketplaceProduct.description}
                              </p>
                              {selectedMarketplaceProduct.materials && (
                                <p className="text-neutral-600 text-sm mb-1">
                                  <span className="font-medium text-neutral-700">Materials:</span> {selectedMarketplaceProduct.materials}
                                </p>
                              )}
                              {selectedMarketplaceProduct.dimensions && (
                                <p className="text-neutral-600 text-sm mb-4">
                                  <span className="font-medium text-neutral-700">Dimensions:</span> {selectedMarketplaceProduct.dimensions}
                                </p>
                              )}
                              <div className="flex gap-3 pt-4 border-t border-greige-light">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleShopAddToCart(selectedMarketplaceProduct); setSelectedMarketplaceProduct(null); }}
                                  disabled={(selectedMarketplaceProduct.stock || 0) === 0}
                                  className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {(selectedMarketplaceProduct.stock || 0) === 0 ? 'Sold Out' : 'Add to cart'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                  {hasMoreMarketplace && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setShopDisplayCount(prev => prev + 12)}
                        className="btn-outline px-8 py-2"
                      >
                        Load more products
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Featured makers + maker profiles + story behind the products */}
            <div className="mt-8 md:mt-10 mb-14">
              <h2 className="font-serif text-3xl md:text-4xl text-center text-neutral-600 mb-3 md:mb-4">
                Meet Our Makers
              </h2>
              <p className="text-neutral-600 text-sm md:text-base max-w-3xl mx-auto mb-6 md:mb-8 text-center">
                Each maker is a mom building a product-based business alongside motherhood. Browse their profiles,
                discover where they&apos;re based, and learn the story behind the pieces you bring home.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {makersLoading && makers.length === 0 && (
                  <p className="text-center text-neutral-500 col-span-full">Loading makers…</p>
                )}
                {!makersLoading && makers.length === 0 && (
                  <p className="text-center text-neutral-500 col-span-full">
                    Maker profiles will appear here as approved vendors publish their profile.
                  </p>
                )}
                {makers.map((vendor, index) => (
                  <Link
                    key={vendor.id}
                    to={vendor.slug ? `/maker/${vendor.slug}` : '/momade/shop'}
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="card hover:scale-105 transition-transform duration-300"
                    >
                      {/* Vendor Avatar */}
                      {vendor.avatarUrl ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border border-greige-light">
                          <img
                            src={vendor.avatarUrl}
                            alt={vendor.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-sage-muted/20 mb-4" />
                      )}
                      
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
                  </Link>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-14">
              <h2 className="font-serif text-3xl md:text-4xl text-center text-neutral-600 mb-6 md:mb-8">
                How It Works
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
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
            <div className="card bg-gradient-to-br from-sage/10 to-taupe/10 p-8 md:p-10 text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-600 mb-6 md:mb-8">
                Why Join MOMade?
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
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
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link to="/contact#book" className="btn-outline">
                  Book design with Magari
                </Link>
                <InstagramDmCta className="btn-outline" />
              </div>
            </div>

            <PageBottomCta
              headline="Shopping MOMade + fixing up your house?"
              body="Design help lives on Magari services pages. Brokerage is separate (eXp Realty). DM for quick links."
              primaryLabel="Book a Consultation"
            />
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
                    Preferred payout method *
                  </label>
                  <select
                    required
                    value={applicationData.payoutMethod}
                    onChange={(e) => setApplicationData({ ...applicationData, payoutMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank transfer</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="other">Other (tell us below)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Payout details *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicationData.payoutEmail}
                    onChange={(e) => setApplicationData({ ...applicationData, payoutEmail: e.target.value })}
                    className="input-field"
                    placeholder={
                      applicationData.payoutMethod === 'paypal'
                        ? 'PayPal email'
                        : applicationData.payoutMethod === 'bank'
                        ? 'Bank name + account number or IBAN'
                        : applicationData.payoutMethod === 'zelle'
                        ? 'Zelle email or phone'
                        : applicationData.payoutMethod === 'venmo'
                        ? '@yourvenmousername'
                        : 'Describe how you prefer to be paid'
                    }
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    We currently process payouts manually every 2 weeks. You keep 88% of each sale; 12% goes to platform fees.
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
              setIsLoggedIn(false)
              setView('landing')
              clearVendorSession()
            }}
            onMarketplaceProductsSynced={refreshMarketplaceProducts}
          />
        )}
      </div>
    </div>
  )
}
