import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, X, ShoppingCart, Heart, Eye, ChevronDown, ChevronUp, 
  Search, Star, Share2, Mail, Instagram, Loader2
} from 'lucide-react'
import { useProductsStore } from '../store/productsStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [availability, setAvailability] = useState('all')
  const [selectedColor, setSelectedColor] = useState('all')
  const [selectedMaterial, setSelectedMaterial] = useState('all')
  const [selectedCollection, setSelectedCollection] = useState('all')
  const [selectedShipping, setSelectedShipping] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [displayCount, setDisplayCount] = useState(12)
  const [showNewsletter, setShowNewsletter] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  
  const { getAllProducts } = useProductsStore()
  const { addItem, openCart } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const categories = ['all', 'Ceramics', 'Stationery', 'Decor', 'Art Prints', 'Seasonal', 'Gift Sets']
  const colors = ['all', 'Neutral', 'Terracotta', 'Green', 'Blue', 'Mixed']
  const materials = ['all', 'Clay', 'Paper', 'Fabric', 'Wood']
  const collections = ['all', 'Elemento', 'Casa Magari', 'Limited Edition']
  const shippingOptions = ['all', 'PR only', 'USA', 'Both']

  const allProducts = getAllProducts()

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
    
    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    
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
    
    // Collection filter (if product has collection property)
    if (selectedCollection !== 'all') {
      filtered = filtered.filter(product => 
        product.collection === selectedCollection
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
    selectedColor, selectedMaterial, selectedCollection, selectedShipping, sortBy
  ])

  const displayedProducts = filteredProducts.slice(0, displayCount)
  const hasMore = displayCount < filteredProducts.length

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange([0, 500])
    setAvailability('all')
    setSelectedColor('all')
    setSelectedMaterial('all')
    setSelectedCollection('all')
    setSelectedShipping('all')
  }

  const handleAddToCart = (product) => {
    addItem(product)
    // Cart won't open automatically - user can click cart icon when ready
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

  const handleQuickView = (product, e) => {
    e.stopPropagation()
    setSelectedProduct(product)
  }

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // 🔌 INTEGRATION: Newsletter signup
    // await fetch('/api/newsletter', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: newsletterEmail })
    // })
    alert('Thank you for joining the Magari family!')
    setNewsletterEmail('')
    setShowNewsletter(false)
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
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-700 mb-4">
            Shop Magari & Co.
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Handpicked pieces for cozy, artful homes.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Left Column */}
          <aside className="lg:w-64 flex-shrink-0">
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

            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block card p-6 sticky top-24`}>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                  >
                    <option value="all">All Products</option>
                    <option value="in-stock">In Stock</option>
                    <option value="sold-out">Sold Out</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                  >
                    {colors.map(color => (
                      <option key={color} value={color}>{color === 'all' ? 'All Colors' : color}</option>
                    ))}
                  </select>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                  >
                    {materials.map(material => (
                      <option key={material} value={material}>{material === 'all' ? 'All Materials' : material}</option>
                    ))}
                  </select>
                </div>

                {/* Collection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Collection</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                  >
                    {collections.map(collection => (
                      <option key={collection} value={collection}>{collection === 'all' ? 'All Collections' : collection}</option>
                    ))}
                  </select>
                </div>

                {/* Shipping */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Shipping</label>
                  <select
                    value={selectedShipping}
                    onChange={(e) => setSelectedShipping(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none text-sm"
                  >
                    {shippingOptions.map(option => (
                      <option key={option} value={option}>{option === 'all' ? 'All Shipping' : option}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full btn-outline py-2 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content - Right Side */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-neutral-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-greige-light focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="bestselling">Bestselling</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {displayedProducts.length === 0 ? (
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
                    className="card group relative hover:shadow-soft-lg transition-all duration-300"
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
                          onClick={(e) => handleQuickView(product, e)}
                          className="p-2 rounded-full bg-white/90 text-neutral-600 hover:bg-white transition-colors"
                          aria-label="Quick view"
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
                      onClick={() => handleAddToCart(product)}
                      disabled={(product.stock || 0) === 0}
                      className="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 inline-block mr-2" />
                      {(product.stock || 0) === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>

                    {/* Back-in-stock Alert */}
                    {(product.stock || 0) === 0 && (
                      <button
                        onClick={() => {
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

            {/* Newsletter Opt-in */}
            {showNewsletter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card text-center py-12 mb-12"
              >
                <h3 className="font-serif text-3xl text-neutral-700 mb-2">
                  Join the Magari family
                </h3>
                <p className="text-neutral-600 mb-6">
                  Get updates & exclusive launches delivered to your inbox.
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
                    Subscribe
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              onClick={(e) => e.stopPropagation()}
              className="fixed left-1/2 top-1/2 w-[90%] max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[60] overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                  {selectedProduct.tags?.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-sage-muted/30 text-sage-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl md:text-3xl text-neutral-700 mb-2">
                  {selectedProduct.title}
                </h2>

                {/* Price */}
                <p className="text-2xl font-semibold text-sage mb-6">
                  ${selectedProduct.price}
                </p>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Materials */}
                {selectedProduct.materials && (
                  <div className="mb-4">
                    <p className="text-neutral-600 text-sm">
                      <span className="font-medium text-neutral-700">Materials:</span> {selectedProduct.materials}
                    </p>
                  </div>
                )}

                {/* Dimensions */}
                {selectedProduct.dimensions && (
                  <div className="mb-6">
                    <p className="text-neutral-600 text-sm">
                      <span className="font-medium text-neutral-700">Dimensions:</span> {selectedProduct.dimensions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-greige-light">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    disabled={(selectedProduct.stock || 0) === 0}
                    className="flex-1 btn-outline py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleBuyNow(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    disabled={(selectedProduct.stock || 0) === 0}
                    className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
