import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X, LogIn, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import BookConsultButton from './BookConsultButton'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState(null) // 'admin' | 'vendor' | 'customer' | null
  const { openCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Real Estate', href: '/real-estate' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Shop', href: '/shop' },
    { name: 'MOMade Marketplace', href: '/momade', isIcon: true },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

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

  return (
    <header className="sticky top-0 z-50 bg-cream/98 backdrop-blur-md border-b border-greige-light/40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28 md:h-36">
          {/* Logo - Replace /logo.png with your actual logo file */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Magari & Co" 
              className="h-24 md:h-32"
              onError={(e) => {
                // Fallback to text if image not found
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-7">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={
                  item.isIcon
                    ? 'flex items-center gap-2 text-stone hover:text-sage transition-colors font-medium tracking-wide'
                    : 'text-stone hover:text-sage transition-colors font-medium tracking-wide'
                }
                aria-label={item.isIcon ? 'MOMade Marketplace' : item.name}
              >
                {item.isIcon ? (
                  <>
                    <img
                      src="/momade-logo.png"
                      alt=""
                      className="h-11 w-auto object-contain opacity-90"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <span className="hidden xl:inline">MOMade Marketplace</span>
                    <span className="xl:hidden">MOMade</span>
                  </>
                ) : (
                  item.name
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5 relative">
            <BookConsultButton
              variant="modal"
              className="shrink-0 rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
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
                    to="/rewards/dashboard"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-cream transition-colors"
                  >
                    Magari Rewards Program
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-cream transition-colors"
                  >
                    Admin login
                  </Link>
                  <Link
                    to="/momade/vendor-login"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-cream transition-colors"
                  >
                    Vendor login
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

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
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
                  className="absolute -top-1 -right-1 bg-sage text-sage-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#B8C5BA', color: '#4A5A4E' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile menu button */}
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

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-neutral-200 bg-cream"
          >
            <div className="px-4 py-4 space-y-3">
              <BookConsultButton
                variant="modal"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center rounded-2xl bg-sage text-white font-semibold py-3"
              >
                Book a Consultation
              </BookConsultButton>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-stone hover:text-sage transition-colors font-medium"
                >
                  {item.isIcon ? (
                    <>
                      <img 
                        src="/momade-logo.png" 
                        alt="MOMade Marketplace" 
                        className="h-12 w-auto"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <span>MOMade Marketplace</span>
                    </>
                  ) : (
                    item.name
                  )}
                </Link>
              ))}
              <div className="border-t border-greige-light pt-3 mt-3 space-y-1">
                <p className="text-xs text-neutral-500 mb-1">Account</p>
                <Link
                  to="/rewards/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-stone hover:text-sage font-medium text-sm"
                >
                  <User className="w-4 h-4" /> Magari Rewards Program
                </Link>
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-stone hover:text-sage font-medium text-sm"
                  >
                    <LogIn className="w-4 h-4" /> Admin
                  </Link>
                )}
                {userRole === 'vendor' && (
                  <Link
                    to="/momade/vendor-login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-stone hover:text-sage font-medium text-sm"
                  >
                    <LogIn className="w-4 h-4" /> Vendor (Marketplace)
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

