import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MapPin, ArrowLeft, ShoppingCart, X } from 'lucide-react'
import { sampleVendors } from '../data/sampleData'
import { useCartStore } from '../store/cartStore'
import { useVendorProductsStore } from '../store/vendorProductsStore'
import { useState } from 'react'

export default function VendorProfilePage() {
  const { slug } = useParams()
  const { getVendorProducts } = useVendorProductsStore()
  const { addItem, openCart } = useCartStore()
  
  // Get vendor from sample data (basic info)
  let vendor = sampleVendors.find(v => v.slug === slug)
  
  // If vendor exists in sample data, merge with products from store
  if (vendor) {
    const storeProducts = getVendorProducts(slug)
    vendor = {
      ...vendor,
      products: storeProducts.length > 0 ? storeProducts : vendor.products // Use store products if available
    }
  }
  const [selectedProduct, setSelectedProduct] = useState(null)

  if (!vendor) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-sage-dark mb-4">Vendor Not Found</h1>
          <Link to="/marketplace" className="text-sage hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = (product) => {
    addItem(product)
    // Cart won't open automatically - user can click cart icon when ready
  }

  const handleBuyNow = (product) => {
    addItem(product)
    openCart()
    // 🔌 INTEGRATION: Redirect to checkout directly
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/marketplace" 
          className="inline-flex items-center text-stone hover:text-sage transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>

        {/* Vendor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 md:p-12 mb-12"
        >
          <div className="md:flex md:items-start md:gap-8">
            {/* Vendor Avatar Placeholder */}
            <div className="w-32 h-32 rounded-full bg-sage-muted/20 mb-6 md:mb-0 flex-shrink-0" />
            
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl text-sage-dark mb-2">
                    {vendor.businessName}
                  </h1>
                  <p className="text-lg text-stone mb-1">by {vendor.name}</p>
                  <p className="text-sm text-stone-light flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {vendor.location}
                  </p>
                </div>
                
                {vendor.instagram && (
                  <a
                    href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sage hover:text-sage-dark transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                    {vendor.instagram}
                  </a>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.categories.map(cat => (
                  <span key={cat} className="badge badge-maker">
                    {cat}
                  </span>
                ))}
              </div>

              <p className="text-lg text-stone mb-6 leading-relaxed">
                {vendor.bio}
              </p>

              {vendor.story && (
                <div className="p-6 bg-cream rounded-xl border border-sage-muted/20">
                  <h3 className="font-serif text-xl text-sage-dark mb-3">My Story</h3>
                  <p className="text-stone leading-relaxed">
                    {vendor.story}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Products */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-sage-dark mb-6">
            Shop {vendor.businessName}
          </h2>
          <p className="text-stone mb-8">
            {vendor.products.length} {vendor.products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendor.products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-greige-light rounded-xl mb-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-stone-light text-sm">
                  Product Image
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-2">
                {product.tags.map(tag => (
                  <span key={tag} className={`badge badge-${tag}`}>
                    {tag}
                  </span>
                ))}
                {product.stock < 5 && (
                  <span className="badge bg-earth-light/30 text-earth-dark">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Product Info */}
              <h3 className="font-serif text-xl text-sage-dark mb-2 group-hover:text-sage transition-colors">
                {product.title}
              </h3>
              <p className="text-stone text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              <p className="text-2xl font-semibold text-sage mb-4">
                ${product.price}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(product)
                  }}
                  className="flex-1 btn-outline py-2 text-sm flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBuyNow(product)
                  }}
                  className="flex-1 btn-primary py-2 text-sm"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setSelectedProduct(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                onClick={(e) => e.stopPropagation()}
                className="fixed left-1/2 top-1/2 w-[90%] max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto"
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

                {/* Vendor Name */}
                <p className="text-neutral-500 text-sm mb-4">by {vendor.businessName}</p>

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
                    className="flex-1 btn-outline py-2.5 text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleBuyNow(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="flex-1 btn-primary py-2.5 text-sm"
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
    </div>
  )
}

