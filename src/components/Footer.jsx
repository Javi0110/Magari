import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // 🔌 INTEGRATION: Connect to your email service (SendGrid, Mailchimp, etc.)
    // POST to /api/newsletter with email
    console.log('Newsletter signup:', email)
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl text-neutral-600 font-semibold mb-4">
              Magari & Co.
            </h3>
            <p className="text-neutral-500 text-sm mb-4">
              From a dream to your reality. Handmade decor, styling services, and a curated marketplace.
            </p>
            <p className="text-xs text-neutral-400">
              🚚 Shipping to USA & Puerto Rico
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-600 mb-4">Shop Magari</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=elementos" className="text-neutral-500 hover:text-sage transition-colors">Elementos Collection</Link></li>
              <li><Link to="/shop?category=handmade" className="text-neutral-500 hover:text-sage transition-colors">Handmade</Link></li>
              <li><Link to="/shop?category=resale" className="text-neutral-500 hover:text-sage transition-colors">Resale/Curated</Link></li>
              <li><Link to="/shop?category=bundles" className="text-neutral-500 hover:text-sage transition-colors">Bundles</Link></li>
            </ul>
          </div>

          {/* Services & Info */}
          <div>
            <h4 className="font-semibold text-neutral-600 mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/design-services" className="text-neutral-500 hover:text-sage transition-colors">Design Services</Link></li>
              <li><Link to="/marketplace" className="text-neutral-500 hover:text-sage transition-colors">MOMade</Link></li>
              <li><Link to="/about" className="text-neutral-500 hover:text-sage transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-neutral-500 hover:text-sage transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-neutral-600 mb-4">Stay Connected</h4>
            <form onSubmit={handleNewsletterSubmit} className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="input-field text-sm mb-2"
              />
              <button
                type="submit"
                className="w-full btn-primary py-2 text-sm"
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/magariandco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-sage transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@magariandco.com"
                className="text-neutral-500 hover:text-sage transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-sage transition-colors"
                aria-label="Location"
              >
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Magari & Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

