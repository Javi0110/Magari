import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Upload } from 'lucide-react'
import { sampleTestimonials } from '../data/sampleData'

export default function TestimonialsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    text: '',
    photo: null
  })
  const [photoPreview, setPhotoPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 🔌 INTEGRATION: Submit review to backend
    // POST /api/testimonials with formData
    // Set approved: false for moderation
    // Send notification to admin for review
    
    console.log('Review submitted:', formData)
    alert('✓ Thank you! Your review has been submitted and will appear after approval.')
    
    // Reset form
    setFormData({ name: '', rating: 5, text: '', photo: null })
    setPhotoPreview(null)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-600 mb-4">
            What Our Clients Say
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-8">
            Real reviews from real people who've transformed their spaces with Magari & Co.
          </p>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <form onSubmit={handleSubmit} className="card p-8">
              <h2 className="font-serif text-3xl text-neutral-700 mb-6">
                Share Your Experience
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Jessica M."
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= formData.rating
                              ? 'fill-taupe text-taupe'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Your Review * (min 20 characters)
                  </label>
                  <textarea
                    required
                    minLength={20}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="input-field min-h-32"
                    placeholder="Tell us about your experience with Magari & Co..."
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {formData.text.length} characters
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-2">
                    Photo (optional)
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center hover:border-sage transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-xl mb-3"
                        />
                      ) : (
                        <Upload className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
                      )}
                      <p className="text-neutral-600 text-sm">
                        {photoPreview ? 'Change photo' : 'Upload a photo (optional)'}
                      </p>
                    </label>
                  </div>
                </div>

                <p className="text-sm text-neutral-500">
                  Reviews are moderated and will be published after approval.
                </p>

                <button type="submit" className="w-full btn-primary py-3">
                  Submit Review
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-taupe text-taupe" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-neutral-600 mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0" />
                <p className="font-semibold text-neutral-700">{testimonial.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

