import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, ArrowLeft, ShoppingCart, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProductsStore } from '../store/productsStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { supabase } from '../utils/supabase'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAllProducts } = useProductsStore()
  const { addItem, openCart } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const products = getAllProducts()
  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [products, id]
  )

  const [imageIndex, setImageIndex] = useState(0)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    text: '',
  })

  useEffect(() => {
    if (!product) return
    setImageIndex(0)
  }, [product])

  useEffect(() => {
    if (!product) return
    if (!supabase) {
      setReviews([])
      setReviewsLoading(false)
      setReviewsError('Reviews need Supabase configured.')
      return
    }
    const load = async () => {
      setReviewsLoading(true)
      setReviewsError(null)
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error loading product reviews:', error)
        setReviewsError('Could not load reviews right now.')
        setReviews([])
      } else {
        const approved = (data || []).filter((r) => r.status === 'approved')
        setReviews(approved)
      }
      setReviewsLoading(false)
    }
    load()
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product)
  }

  const handleBuyNow = () => {
    if (!product) return
    addItem(product)
    openCart()
  }

  const toggleWishlist = () => {
    if (!product) return
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!product) return
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return
    const email = reviewForm.email.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      alert('Please enter your email so we can award your Magari Rewards points when the review is approved.')
      return
    }

    const payload = {
      product_id: product.id,
      name: reviewForm.name.trim(),
      email,
      rating: reviewForm.rating,
      text: reviewForm.text.trim(),
      status: 'pending',
    }

    try {
      setSubmitting(true)
      if (supabase) {
        const { data, error } = await supabase
          .from('product_reviews')
          .insert(payload)
          .select('*')
          .single()
        if (error) throw error
        alert('Thank you! Your review will appear here after we approve it. You’ll earn 20 Magari Rewards points once it’s approved.')
      } else {
        // Fallback: local-only
        const localReview = {
          ...payload,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
        }
        setReviews((prev) => [localReview, ...prev])
      }
      setReviewForm({ name: '', email: '', rating: 5, text: '' })
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('We could not save your review right now. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-3xl text-neutral-800 mb-3">Product not found</h1>
          <p className="text-neutral-600 mb-6">
            The piece you&apos;re looking for may have been moved or is no longer available.
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  const images = Array.isArray(product.images) ? product.images : []
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <nav className="flex items-center text-sm text-neutral-500">
            <Link to="/" className="hover:text-sage transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-sage transition-colors">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-700 line-clamp-1 max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </nav>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hidden sm:inline-flex items-center text-sm text-neutral-500 hover:text-sage transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="relative bg-neutral-100 rounded-2xl overflow-hidden mb-4">
              <div className="aspect-square flex items-center justify-center">
                {images.length > 0 ? (
                  <img
                    src={images[imageIndex] || images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-neutral-400 text-sm">No image</div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-neutral-700 hover:bg-white shadow"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex((i) =>
                        i >= images.length - 1 ? 0 : i + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-neutral-700 hover:bg-white shadow"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      idx === imageIndex
                        ? 'border-sage ring-1 ring-sage'
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + actions */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-xs font-medium text-sage-dark uppercase tracking-wide">
                {product.category}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-taupe text-taupe'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs">
                {reviews.length === 0
                  ? 'No reviews yet'
                  : `${averageRating.toFixed(1)} · ${reviews.length} ${
                      reviews.length === 1 ? 'review' : 'reviews'
                    }`}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-neutral-800">
              {product.title}
            </h1>
            <p className="text-2xl font-semibold text-sage">
              ${product.price}
            </p>

            <p className="text-neutral-700 text-sm leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-1 text-sm text-neutral-700">
              {product.materials && (
                <p>
                  <span className="font-medium text-neutral-800">
                    Materials:
                  </span>{' '}
                  {product.materials}
                </p>
              )}
              {product.dimensions && (
                <p>
                  <span className="font-medium text-neutral-800">
                    Dimensions:
                  </span>{' '}
                  {product.dimensions}
                </p>
              )}
              {product.shipping && (
                <p>
                  <span className="font-medium text-neutral-800">
                    Shipping:
                  </span>{' '}
                  {product.shipping} · $6.75 flat, free over $60
                </p>
              )}
              {(product.returnPolicy || product.return_policy) && (
                <p>
                  <span className="font-medium text-neutral-800">
                    Returns:
                  </span>{' '}
                  {product.returnPolicy || product.return_policy}
                </p>
              )}
              {(product.stock || 0) > 0 && (
                <p className="text-neutral-500">
                  In stock — {product.stock} available
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-greige-light">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 min-w-[160px] btn-outline flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 min-w-[160px] btn-primary flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={toggleWishlist}
                className="px-4 py-2 rounded-xl border border-greige-light text-sm flex items-center gap-2 text-neutral-700 hover:border-sage hover:text-sage transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(product.id) ? 'fill-current text-sage' : ''
                  }`}
                />
                {isInWishlist(product.id) ? 'Saved' : 'Save to wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 grid lg:grid-cols-[3fr,2fr] gap-10">
          <div>
            <h2 className="font-serif text-2xl text-neutral-800 mb-3">
              Customer Reviews
            </h2>
            {reviewsLoading ? (
              <p className="text-neutral-600 text-sm">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-neutral-600 text-sm">
                No reviews yet. Be the first to share your thoughts on this piece.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-greige-light p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-neutral-800">
                        {review.name}
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (review.rating || 0)
                                ? 'fill-taupe text-taupe'
                                : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {review.text}
                    </p>
                    {review.created_at && (
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {reviewsError && (
              <p className="mt-2 text-xs text-red-500">{reviewsError}</p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="font-serif text-xl text-neutral-800 mb-3">
              Write a review
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  required
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="input-field text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  required
                  value={reviewForm.email}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="input-field text-sm"
                  placeholder="you@email.com"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Used for your Magari Rewards account; we award 20 pts when your review is approved.
                </p>
              </div>
              <div>
                <label className="form-label">Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setReviewForm((f) => ({ ...f, rating }))
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          rating <= reviewForm.rating
                            ? 'fill-taupe text-taupe'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">
                  Your review * (min 20 characters)
                </label>
                <textarea
                  required
                  minLength={20}
                  value={reviewForm.text}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, text: e.target.value }))
                  }
                  className="input-field text-sm min-h-28"
                  placeholder="Share how this piece looks and feels in your space…"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  {reviewForm.text.length} characters
                </p>
              </div>
              <p className="text-[11px] text-neutral-500">
                Reviews are moderated to keep this space kind and helpful.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Submit review'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

