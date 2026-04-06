import { useState, useMemo, useEffect, useLayoutEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Filter, X, ShoppingCart, Heart, Eye, ChevronDown, ChevronUp, 
  ChevronLeft, ChevronRight, Search, Star, Share2, Mail, Instagram, Loader2
} from 'lucide-react'
import { useProductsStore, fetchShopProducts, fromDb } from '../store/productsStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { supabase } from '../utils/supabase'
import { SHOP_MAGARI_CATEGORIES } from '../constants/shopCategories'
import InlineSelect from '../components/InlineSelect'

/** Default + slider max; previously 500 hid everything above $500 */
const SHOP_PRICE_FILTER_MAX = 50000

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, SHOP_PRICE_FILTER_MAX])
  const [availability, setAvailability] = useState('all')
  const [selectedColor, setSelectedColor] = useState('all')
  const [selectedMaterial, setSelectedMaterial] = useState('all')
  const [selectedShipping, setSelectedShipping] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [openFilter, setOpenFilter] = useState('category')
  const [sortBy, setSortBy] = useState('featured')
  const [displayCount, setDisplayCount] = useState(12)
  const [showNewsletter, setShowNewsletter] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState(null)
  const [abandonedEmail, setAbandonedEmail] = useState('')
  const [abandonedStatus, setAbandonedStatus] = useState(null)
  const [rescueProducts, setRescueProducts] = useState([])
  
  const { getAllProducts, initProducts, loading, error, catalogFetchPending } = useProductsStore()
  const { addItem, openCart } = useCartStore()
  const cartItems = useCartStore((s) => s.items)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const navigate = useNavigate()

  const categories = ['all', ...SHOP_MAGARI_CATEGORIES]
  const colors = ['all', 'Neutral', 'Terracotta', 'Green', 'Blue', 'Mixed']
  const materials = ['all', 'Clay', 'Paper', 'Fabric', 'Wood']
  const shippingOptions = ['all', 'PR only', 'USA', 'Both']

  useLayoutEffect(() => {
    if (!supabase) return
    const { initialized } = useProductsStore.getState()
    if (!initialized) {
      useProductsStore.setState({ catalogFetchPending: true })
    }
  }, [])

  useEffect(() => {
    initProducts().catch(() => {})
  }, [initProducts])

  const storeProducts = getAllProducts()

  useEffect(() => {
    const shouldRescue =
      !loading &&
      !catalogFetchPending &&
      Array.isArray(storeProducts) &&
      storeProducts.length === 0 &&
      !!supabase
    if (!shouldRescue) return
    let cancelled = false

    fetchShopProducts()
      .then((result) => {
        if (cancelled || result.error) return
        const rows = Array.isArray(result.data) ? result.data : []
        setRescueProducts(rows.map(fromDb))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [loading, catalogFetchPending, storeProducts])

  const allProducts = storeProducts.length > 0 ? storeProducts : rescueProducts

  const getCartQuantity = (productId) => {
    const item = cartItems.find((p) => p.id === productId)
    return item ? item.quantity || 0 : 0
  }

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    // Price range filter (coerce: DB may return string)
    filtered = filtered.filter((product) => {
      const price = Number(product.price)
      if (!Number.isFinite(price)) return true
      return price >= priceRange[0] && price <= priceRange[1]
    })
    
    // Availability filter
    if (availability === 'in-stock') {
      filtered = filtered.filter(product => (product.stock || 0) > 0)
    } else if (availability === 'sold-out') {
      filtered = filtered.filter(product => (product.stock || 0) === 0)
    }
    
    // Color filter (if product has color property)
    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => 
        product.color?.toLowerCase() === selectedColor.toLowerCase()
      )
    }
    
    // Material filter (if product has materials property)
    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(product => 
        product.materials?.toLowerCase().includes(selectedMaterial.toLowerCase())
      )
    }
    
    // Shipping filter (if product has shipping property)
    if (selectedShipping !== 'all') {
      filtered = filtered.filter(product => {
        const shipping = product.shipping?.toLowerCase() || ''
        if (selectedShipping === 'pr only') return shipping.includes('pr only')
        if (selectedShipping === 'usa') return shipping.includes('usa') && !shipping.includes('pr')
        if (selectedShipping === 'both') return shipping.includes('usa') && shipping.includes('pr')
        return true
      })
    }
    
    // Sort products
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'bestselling':
        // Sort by bestseller badge or sales count if available
        filtered.sort((a, b) => {
          const aBestseller = a.badge === 'bestseller' ? 1 : 0
          const bBestseller = b.badge === 'bestseller' ? 1 : 0
          return bBestseller - aBestseller
        })
        break
      case 'featured':
      default:
        // Featured first, then by creation date
        filtered.sort((a, b) => {
          const aFeatured = a.badge === 'featured' ? 1 : 0
          const bFeatured = b.badge === 'featured' ? 1 : 0
          if (aFeatured !== bFeatured) return bFeatured - aFeatured
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        })
        break
    }
    
    return filtered
  }, [
    allProducts, searchQuery, selectedCategory, priceRange, availability,
    selectedColor, selectedMaterial, selectedShipping, sortBy
  ])

  const displayedProducts = filteredProducts.slice(0, displayCount)
  const hasMore = displayCount < filteredProducts.length

  const bestSellers = useMemo(
    () => filteredProducts.filter(p => p.badge === 'bestseller').slice(0, 4),
    [filteredProducts]
  )

  const newArrivals = useMemo(
    () =>
      filteredProducts
        .filter(p => p.badge === 'new')
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [filteredProducts]
  )

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange([0, SHOP_PRICE_FILTER_MAX])
    setAvailability('all')
    setSelectedColor('all')
    setSelectedMaterial('all')
    setSelectedShipping('all')
  }

  const handleAddToCart = (product) => {
    addItem(product)
    openCart()
  }

  const handleBuyNow = (product) => {
    addItem(product)
    openCart()
    // 🔌 INTEGRATION: Redirect to checkout
  }

  const toggleWishlist = (product, e) => {
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const openProductDetail = (product) => {
    navigate(`/shop/${product.id}`)
  }

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail) return
    try {
      setNewsletterStatus('saving')
      if (supabase) {
        await supabase
          .from('shop_newsletter_signups')
          .insert({ email: newsletterEmail, source: 'shop' })
      }
      setNewsletterStatus('success')
      setNewsletterEmail('')
      setShowNewsletter(false)
    } catch (err) {
      console.error('Error saving newsletter signup:', err)
      setNewsletterStatus('error')
    }
  }

  const getBadge = (product) => {
    if (product.badge === 'new') return { text: 'New', className: 'bg-sage/20 text-sage-dark' }
    if (product.badge === 'bestseller') return { text: 'Bestseller', className: 'bg-earth/20 text-earth-dark' }
    if (product.badge === 'limited' || (product.stock && product.stock < 5 && product.stock > 0)) {
      return { text: 'Limited Stock', className: 'bg-taupe/20 text-taupe-dark' }
    }
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-neutral-500">
            <Link to="/" className="hover:text-sage transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700">Shop</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header + hero for Shop Magari */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-700 mb-3">
            Shop Magari &amp; Co.
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-5">
            Curated decor and home goods selected to bring warmth, texture, and story into your everyday spaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="btn-primary"
            >
              Shop All Products
            </button>
          </div>
          <p className="mt-4 text-sm text-neutral-600">
            Earn points with <button
              type="button"
              onClick={() => navigate('/rewards')}
              className="underline underline-offset-2 hover:text-sage"
            >
              Magari Rewards Circle
            </button>{' '}
            every time you shop.
          </p>
        </div>

        {/* Best sellers + New arrivals */}
        {(bestSellers.length > 0 || newArrivals.length > 0) && (
          <section className="mb-12">
            <div className="grid lg:grid-cols-2 gap-8">
              {bestSellers.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl text-neutral-800 mb-3">Best sellers</h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Pieces our community keeps coming back for again and again.
                  </p>
                  <div className="space-y-3">
                    {bestSellers.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => openProductDetail(product)}
                        className="w-full flex items-center gap-4 text-left hover:bg-cream rounded-2xl px-3 py-3 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-xl bg-neutral-200 overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-800 truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-neutral-500 line-clamp-1">
                            {product.description}
                          </p>
                          <p className="text-sm font-semibold text-sage mt-1">
                            ${product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newArrivals.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl text-neutral-800 mb-3">New arrivals</h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Fresh pieces just added to the shop.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {newArrivals.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => openProductDetail(product)}
                        className="card px-3 py-3 text-left hover:shadow-soft-lg transition-shadow"
                      >
                        <div className="w-full aspect-square rounded-xl bg-neutral-200 overflow-hidden mb-2">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <p className="font-medium text-sm text-neutral-800 line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-sm font-semibold text-sage mt-1">
                          ${product.price}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Left Column */}
          <aside className="lg:w-72 flex-shrink-0">
            {/* Filter Toggle for Mobile */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full btn-outline flex items-center justify-center"
              >
                <Filter className="w-5 h-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
            </div>

            {/* Filters Sidebar / Panel */}
            <div
              className={`
                lg:block lg:static lg:translate-x-0
                fixed inset-y-0 right-0 w-full max-w-xs bg-cream/98 backdrop-blur-md border-l border-cream-dark/40 z-40
                transition-transform duration-300 ease-out
                ${showFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              `}
            >
              <div className="h-full lg:h-auto lg:bg-transparent lg:border-none lg:p-0 flex flex-col">
                {/* Mobile close */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-cream-dark/40 lg:hidden">
                  <p className="font-serif text-lg text-neutral-700">Filter</p>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-neutral-500 hover:text-neutral-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-4 py-4 lg:p-0 lg:pt-2 lg:pb-6 space-y-6">
                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search pieces…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-greige-light bg-white/80 focus:bg-white focus:border-sage focus:ring-2 focus:ring-sage/15 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Accordion filters */}
                  <div className="space-y-4">
                    {/* Category */}
                    <div className="border-b border-cream-dark/50 pb-2">
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === 'category' ? null : 'category')}
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700">
                          Category
                        </span>
                        {openFilter === 'category' ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                      {openFilter === 'category' && (
                        <div className="mt-1 space-y-1 text-sm text-neutral-700">
                          <InlineSelect
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categories.map((cat) => ({
                              value: cat,
                              label: cat === 'all' ? 'All Categories' : cat,
                            }))}
                            placeholder="All Categories"
                          />
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="border-b border-cream-dark/50 pb-2">
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700">
                          Price
                        </span>
                        {openFilter === 'price' ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                      {openFilter === 'price' && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-neutral-500">
                            ${priceRange[0]} – ${priceRange[1]}
                          </p>
                          <input
                            type="range"
                            min="0"
                            max={SHOP_PRICE_FILTER_MAX}
                            step={100}
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
                            className="w-full accent-sage"
                          />
                        </div>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="border-b border-cream-dark/50 pb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFilter(openFilter === 'availability' ? null : 'availability')
                        }
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700">
                          Availability
                        </span>
                        {openFilter === 'availability' ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                      {openFilter === 'availability' && (
                        <div className="mt-1">
                          <InlineSelect
                            value={availability}
                            onChange={setAvailability}
                            options={[
                              { value: 'all', label: 'All Products' },
                              { value: 'in-stock', label: 'In Stock' },
                              { value: 'sold-out', label: 'Sold Out' },
                            ]}
                            placeholder="All Products"
                          />
                        </div>
                      )}
                    </div>

                    {/* Color */}
                    <div className="border-b border-cream-dark/50 pb-2">
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === 'color' ? null : 'color')}
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700">
                          Color
                        </span>
                        {openFilter === 'color' ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                      {openFilter === 'color' && (
                        <div className="mt-1">
                          <InlineSelect
                            value={selectedColor}
                            onChange={setSelectedColor}
                            options={colors.map((color) => ({
                              value: color,
                              label: color === 'all' ? 'All Colors' : color,
                            }))}
                            placeholder="All Colors"
                          />
                        </div>
                      )}
                    </div>

                    {/* Material */}
                    <div className="border-b border-cream-dark/50 pb-2">
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === 'material' ? null : 'material')}
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700">
                          Material
                        </span>
                        {openFilter === 'material' ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                      {openFilter === 'material' && (
                        <div className="mt-1">
                          <InlineSelect
                            value={selectedMaterial}
                            onChange={setSelectedMaterial}
                            options={materials.map((material) => ({
                              value: material,
                              label: material === 'all' ? 'All Materials' : material,
                            }))}
                            placeholder="All Materials"
                          />
                        </div>
                      )}
                    </div>

                    {/* Shipping */}
                    <div className="border-b border-cream-dark/50 pb-2">
                      <button
                        type="button"
                        onClick={() => setOpenFilter(openFilter === 'shipping' ? null : 'shipping')}
                        className="w-full flex items-center justify-between py-2"
                      >
                        <span className="font-serif text-sm tracking-[0.12em] uppercase text-neutral-700">
                          Shipping
                        </span>
                        {openFilter === 'shipping' ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                      {openFilter === 'shipping' && (
                        <div className="mt-1">
                          <InlineSelect
                            value={selectedShipping}
                            onChange={setSelectedShipping}
                            options={shippingOptions.map((option) => ({
                              value: option,
                              label: option === 'all' ? 'All Shipping' : option,
                            }))}
                            placeholder="All Shipping"
                          />
                        </div>
                      )}
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={clearFilters}
                      className="w-full mt-2 text-sm font-medium px-4 py-2 rounded-full border border-sage/40 text-sage hover:bg-cream transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Right Side */}
          <div className="flex-1">
            {/* Best sellers / New arrivals summary + Sort Options */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-neutral-600">
                  {catalogFetchPending && allProducts.length === 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading products…
                    </span>
                  ) : catalogFetchPending && allProducts.length > 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing full catalog…
                    </span>
                  ) : (
                    <>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {catalogFetchPending && allProducts.length > 0
                    ? 'Almost there — loading every piece from the shop.'
                    : 'Use filters above to find the right piece faster.'}
                </p>
                {error && (
                  <p className="mt-1 text-xs text-red-600">
                    Error loading products: {error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <label className="text-sm text-neutral-600">Sort by:</label>
                <InlineSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'featured', label: 'Featured' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'bestselling', label: 'Bestselling' },
                  ]}
                  className="w-44"
                  placeholder="Featured"
                />
              </div>
            </div>

            {/* Product Grid */}
            {catalogFetchPending && allProducts.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-neutral-200 rounded-2xl mb-4" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2 mb-2" />
                    <div className="h-5 bg-neutral-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-600 mb-4">No products match your filters.</p>
                <button onClick={clearFilters} className="btn-outline">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {displayedProducts.map((product, index) => {
                    const badge = getBadge(product)
                    const inWishlist = isInWishlist(product.id)
                    
                    return (
                      <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card group relative hover:shadow-soft-lg transition-all duration-300 cursor-pointer"
                    onClick={() => openProductDetail(product)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-neutral-200 rounded-2xl mb-4 overflow-hidden">
                      {/* Hover effect: show second image if available */}
                      <div className="absolute inset-0">
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            'Product Image'
                          )}
                        </div>
                        {product.images?.[1] && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <img src={product.images[1]} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Badge */}
                      {badge && (
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                          {badge.text}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => toggleWishlist(product, e)}
                          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                            inWishlist 
                              ? 'bg-red-500/90 text-white' 
                              : 'bg-white/90 text-neutral-600 hover:bg-white'
                          }`}
                          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openProductDetail(product)
                          }}
                          className="p-2 rounded-full bg-white/90 text-neutral-600 hover:bg-white transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Sold Out Overlay */}
                      {(product.stock || 0) === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">Sold Out</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="font-serif text-xl text-neutral-700 mb-2 group-hover:text-sage transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-3 line-clamp-1">
                      {product.description}
                    </p>
                    <p className="text-2xl font-semibold text-sage mb-4">
                      ${product.price}
                    </p>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(product)
                      }}
                      disabled={(product.stock || 0) === 0}
                      className="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 inline-block mr-2" />
                      {(product.stock || 0) === 0
                        ? 'Sold Out'
                        : getCartQuantity(product.id) > 0
                        ? `Added (${getCartQuantity(product.id)})`
                        : 'Add to Cart'}
                    </button>

                    {/* Back-in-stock Alert */}
                    {(product.stock || 0) === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const email = prompt('Enter your email for back-in-stock alerts:')
                          if (email) {
                            // 🔌 INTEGRATION: Back-in-stock alert
                            // await fetch('/api/back-in-stock', {
                            //   method: 'POST',
                            //   headers: { 'Content-Type': 'application/json' },
                            //   body: JSON.stringify({ email, productId: product.id })
                            // })
                            alert('You will be notified when this item is back in stock!')
                          }
                        }}
                        className="w-full mt-2 text-sm text-neutral-500 hover:text-sage transition-colors"
                      >
                        Notify me when available
                      </button>
                      )}
                    </motion.div>
                    )
                  })}
                </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mb-12">
                <button
                  onClick={handleLoadMore}
                  className="btn-outline px-8 py-3"
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}

            {/* Customer reviews + Newsletter Opt-in */}
            <div className="space-y-8 mb-12">
              <section className="card px-6 py-8">
                <h3 className="font-serif text-2xl text-neutral-800 mb-4 text-center">
                  What our clients are saying
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-700">
                  <div>
                    <p className="italic mb-2">
                      “The pieces we ordered from Magari completely transformed our living room. Everything feels layered, warm, and intentional.”
                    </p>
                    <p className="text-xs text-neutral-500">— Homeowner in Austin, TX</p>
                  </div>
                  <div>
                    <p className="italic mb-2">
                      “Thoughtful curation and beautiful quality. My clients always ask where I find these accessories.”
                    </p>
                    <p className="text-xs text-neutral-500">— Realtor partner</p>
                  </div>
                  <div>
                    <p className="italic mb-2">
                      “I love that I can shop styling pieces and also book design support from the same studio.”
                    </p>
                    <p className="text-xs text-neutral-500">— Design client</p>
                  </div>
                </div>
              </section>

              {showNewsletter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card text-center py-12"
                >
                  <h3 className="font-serif text-3xl text-neutral-700 mb-2">
                    Join the Magari family
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Get updates &amp; exclusive launches delivered to your inbox.
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      className="flex-1 px-4 py-3 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                    />
                    <button type="submit" className="btn-primary px-6">
                      {newsletterStatus === 'saving' ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  </form>
                  {newsletterStatus === 'error' && (
                    <p className="mt-3 text-xs text-red-500">
                      Something went wrong. Please try again in a moment.
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
