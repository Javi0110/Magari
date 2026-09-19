import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import BookConsultButton from './BookConsultButton'

/** Services submenu — studio offerings already on the site */
const servicesLinks = [
  { name: 'All Services', href: '/services' },
  { name: 'Interior Design', href: '/services/interior-design' },
  { name: 'Virtual Design', href: '/services/virtual-design' },
  { name: 'Home Staging', href: '/services/home-staging' },
  { name: 'Packages & Pricing', href: '/services/packages' },
  { name: 'Real Estate', href: '/real-estate' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const servicesRef = useRef(null)
  const { openCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('magari-current-user')
      if (!raw) {
        setUserRole(null)
        return
      }
      const user = JSON.parse(raw)
      if (user.isMagariAccount) {
        setUserRole('admin')
      } else if (user.vendorId) {
        setUserRole('vendor')
      } else {
        setUserRole('customer')
      }
    } catch {
      setUserRole(null)
    }
  }, [])

  useEffect(() => {
    if (!servicesOpen) return
    const onDoc = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [servicesOpen])

  const closeMobile = () => {
    setMobileMenuOpen(false)
    setMobileServicesOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/98 backdrop-blur-md border-b border-greige-light/40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-4 h-16 md:h-20">
          <Link to="/" className="flex shrink-0 items-center" onClick={closeMobile}>
            <img
              src="/logo.png"
              alt="Magari & Co"
              className="h-14 md:h-16"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="hidden flex-col items-start -space-y-1">
              <span className="font-serif text-2xl md:text-3xl font-normal tracking-wide" style={{ color: '#6B7C70' }}>
                magari & co
              </span>
              <span className="font-serif text-[10px] md:text-xs italic tracking-widest" style={{ color: '#9BA89F' }}>
                Interior Design
              </span>
            </div>
          </Link>

          {/* Desktop: Shop · Services · Magari Rewards */}
          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-8 xl:gap-10 px-2">
            <Link
              to="/shop"
              className="shrink-0 text-sm xl:text-base font-semibold tracking-wide text-sage-dark hover:text-sage transition-colors"
            >
              Shop
            </Link>

            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                onClick={() => setServicesOpen((o) => !o)}
                className="inline-flex items-center gap-1 shrink-0 text-sm xl:text-base text-stone hover:text-sage transition-colors font-medium tracking-wide"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 py-2 bg-white border border-greige-light rounded-2xl shadow-lg shadow-black/5 z-50"
                  >
                    {servicesLinks.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setServicesOpen(false)}
                        className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-cream hover:text-sage transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/rewards/dashboard"
              className="shrink-0 text-sm xl:text-base text-stone hover:text-sage transition-colors font-medium tracking-wide"
            >
              Magari Rewards
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 relative">
            <Link
              to="/about"
              className="text-xs text-neutral-500 hover:text-sage transition-colors tracking-wide"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-xs text-neutral-500 hover:text-sage transition-colors tracking-wide"
            >
              Contact
            </Link>
            <BookConsultButton
              variant="modal"
              className="btn-primary btn-sm btn-pill shrink-0 font-semibold shadow-sm"
            >
              Book a Consultation
            </BookConsultButton>
            <button
              onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              className="flex items-center justify-center text-stone hover:text-sage transition-colors"
              aria-expanded={loginDropdownOpen}
              aria-haspopup="true"
              aria-label="Profile and login"
            >
              <User className="w-6 h-6" />
            </button>
            {loginDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLoginDropdownOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white border border-greige-light rounded-2xl shadow-lg shadow-black/5 z-50">
                  <Link
                    to="/admin"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-cream transition-colors"
                  >
                    Admin login
                  </Link>
                  {userRole && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('magari-current-user')
                        setUserRole(null)
                        setLoginDropdownOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-cream transition-colors border-t border-cream-dark/60 mt-1"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={openCart}
              className="relative p-2 text-stone hover:text-sage transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#B8C5BA', color: '#4A5A4E' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile: Shop · Services · Magari Rewards — About & Contact at bottom */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-neutral-200 bg-cream overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/shop"
                onClick={closeMobile}
                className="block py-3 px-3 rounded-xl bg-sage/15 text-sage-dark font-semibold text-base tracking-wide"
              >
                Shop
              </Link>

              <button
                type="button"
                onClick={() => setMobileServicesOpen((o) => !o)}
                className="w-full flex items-center justify-between py-3 px-3 text-stone font-medium text-base"
                aria-expanded={mobileServicesOpen}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pl-2 space-y-0.5"
                  >
                    {servicesLinks.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={closeMobile}
                        className="block py-2.5 px-3 text-sm text-neutral-600 hover:text-sage"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                to="/rewards/dashboard"
                onClick={closeMobile}
                className="block py-3 px-3 text-stone font-medium text-base hover:text-sage transition-colors"
              >
                Magari Rewards
              </Link>

              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  onClick={closeMobile}
                  className="block py-2 px-3 text-stone hover:text-sage font-medium text-sm"
                >
                  Admin
                </Link>
              )}

              <div className="border-t border-greige-light/80 mt-4 pt-4 flex items-center justify-center gap-6">
                <Link
                  to="/about"
                  onClick={closeMobile}
                  className="text-xs uppercase tracking-[0.18em] text-neutral-400 hover:text-sage transition-colors"
                >
                  About
                </Link>
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
                <Link
                  to="/contact"
                  onClick={closeMobile}
                  className="text-xs uppercase tracking-[0.18em] text-neutral-400 hover:text-sage transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
