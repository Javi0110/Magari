import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    console.log('Newsletter signup:', email)
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <footer className="bg-white border-t border-greige-light/60 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <h3 className="font-serif text-2xl text-neutral-700 font-medium mb-3">Magari &amp; Co.</h3>
            <p className="text-neutral-600 text-sm leading-relaxed mb-4">
              Magari &amp; Co. is an interior design and home staging studio. Shop Magari &amp; MOMade are here when
              you&apos;re ready to layer in goods. Buying and selling guidance is offered separately by Elena Fadhel,
              Realtor<sup>®</sup> @ eXp Realty — not by Magari &amp; Co.
            </p>
            <p className="text-xs text-neutral-500">Serving Austin, TX &amp; select remote projects.</p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-700 mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="text-neutral-600 hover:text-sage transition-colors">
                  Packages &amp; pricing
                </Link>
              </li>
              <li>
                <Link to="/real-estate" className="text-neutral-600 hover:text-sage transition-colors">
                  Real estate
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-neutral-600 hover:text-sage transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact#book" className="text-neutral-600 hover:text-sage transition-colors">
                  Book a consultation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-700 mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="text-neutral-600 hover:text-sage transition-colors">
                  Shop Magari
                </Link>
              </li>
              <li>
                <Link to="/momade" className="text-neutral-600 hover:text-sage transition-colors">
                  MOMade Marketplace
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-600 hover:text-sage transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-600 hover:text-sage transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-700 mb-4 text-sm uppercase tracking-wider">Stay connected</h4>
            <form onSubmit={handleNewsletterSubmit} className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="input-field text-sm mb-2"
              />
              <button type="submit" className="w-full btn-primary py-2.5 text-sm rounded-xl">
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/magari.andco"
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
              <span className="text-neutral-500 inline-flex items-center" aria-label="Location">
                <MapPin className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-greige-light/70 space-y-3 text-center text-xs text-neutral-500 leading-relaxed max-w-3xl mx-auto">
          <p>
            Real estate services provided through eXp Realty. Elena Fadhel, Realtor<sup>®</sup> @ eXp Realty.
            Magari &amp; Co. is not a real estate brokerage.
          </p>
          <p className="text-neutral-400">&copy; {new Date().getFullYear()} Magari &amp; Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
