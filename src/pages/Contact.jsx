import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Instagram, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 🔌 INTEGRATION: Send email via backend
    // POST /api/contact with formData
    // Use SendGrid, Postmark, or similar
    // Send confirmation email to user
    // Send notification to Magari team
    
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
    
    // Reset form after delay
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-600 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Have a question? Want to collaborate? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card p-8">
              <h2 className="font-serif text-3xl text-neutral-700 mb-6">
                Send us a message
              </h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-taupe/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-taupe" />
                  </div>
                  <h3 className="font-serif text-2xl text-neutral-700 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-neutral-600">
                    We'll get back to you within 24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="Elena Fadhel"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="elena@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="styling">Virtual Styling Question</option>
                      <option value="order">Order Status</option>
                      <option value="wholesale">Wholesale/Collaboration</option>
                      <option value="marketplace">Marketplace Question</option>
                      <option value="press">Press/Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-field min-h-32"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-3">
                    <Send className="w-5 h-5 mr-2 inline-block" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Direct Contact */}
            <div className="card p-8">
              <h3 className="font-serif text-2xl text-neutral-700 mb-6">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center text-sage flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700 mb-1">Email</p>
                    <a
                      href="mailto:hello@magariandco.com"
                      className="text-sage hover:underline"
                    >
                      hello@magariandco.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-earth/10 flex items-center justify-center text-earth flex-shrink-0">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700 mb-1">Instagram</p>
                    <a
                      href="https://instagram.com/magariandco"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-earth hover:underline"
                    >
                      @magariandco
                    </a>
                    <p className="text-sm text-neutral-500 mt-1">
                      DM us for quick questions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-taupe/10 flex items-center justify-center text-taupe flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700 mb-1">Location</p>
                    <p className="text-neutral-600">
                      San Juan, Puerto Rico
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Shipping to USA & PR
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Schedule */}
            <div className="card p-8">
              <h3 className="font-serif text-2xl text-neutral-700 mb-4">
                Market Schedule
              </h3>
              <p className="text-neutral-600 mb-4">
                Find us at local markets around San Juan! Come shop in person and meet the team.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium text-neutral-700">Santurce Pop-Up</span>
                  <span className="text-neutral-600">1st Saturday</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium text-neutral-700">Mercado Agrícola</span>
                  <span className="text-neutral-600">2nd & 4th Sunday</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium text-neutral-700">Plaza del Mercado</span>
                  <span className="text-neutral-600">Monthly</span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 mt-4">
                Follow us on Instagram for market updates and location details
              </p>
            </div>

            {/* FAQ Link */}
            <div className="card p-8 text-center bg-gradient-to-br from-sage/10 to-cream">
              <h3 className="font-serif text-2xl text-neutral-700 mb-3">
                Quick Questions?
              </h3>
              <p className="text-neutral-600 mb-4">
                Check out our FAQ for answers to common questions about shipping, returns, and services.
              </p>
              <button className="btn-outline">
                View FAQ
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

