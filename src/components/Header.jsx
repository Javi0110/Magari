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

  /** Core studio pages — single line, no wrap */
  const primaryNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Real Estate', href: '/real-estate' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  /** E-commerce / marketplace — visually secondary */
  const secondaryNavigation = [
    { name: 'Shop Magari', href: '/shop' },
    { name: 'MOMade Marketplace', href: '/momade', isIcon: true },
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
        <div className="flex items-center justify-between gap-3 lg:gap-4 h-28 md:h-36 min-h-[7rem] md:min-h-[9rem]">
          {/* Logo - Replace /logo.png with your actual logo file */}
          <Link to="/" className="flex shrink-0 items-center">
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

          {/* Desktop: primary nav (center) + secondary shops (subtle, one row) */}
          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-4 xl:gap-6 2xl:gap-8 px-2">
            <nav
              aria-label="Main"
              className="flex items-center gap-x-4 xl:gap-x-6 flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {primaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="shrink-0 text-sm xl:text-base text-stone hover:text-sage transition-colors font-medium tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <span className="hidden md:inline-block shrink-0 w-px h-5 bg-greige-light" aria-hidden />
            <nav
              aria-label="Shop and marketplace"
              className="flex items-center gap-x-3 xl:gap-x-4 flex-nowrap shrink-0"
            >
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  title={item.name}
                  className={
                    item.isIcon
                      ? 'flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs xl:text-sm text-neutral-500 hover:text-sage transition-colors font-medium'
                      : 'shrink-0 whitespace-nowrap text-xs xl:text-sm text-neutral-500 hover:text-sage transition-colors font-medium'
                  }
                  aria-label={item.isIcon ? 'MOMade Marketplace' : item.name}
                >
                  {item.isIcon ? (
                    <>
                      <img
                        src="/momade-logo.png"
                        alt=""
                        className="h-8 w-auto object-contain opacity-80 xl:h-9"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <span>MOMade</span>
                    </>
                  ) : (
                    item.name
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 relative">
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
            <div className="px-4 py-4 space-y-1">
              <BookConsultButton
                variant="modal"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary btn-block rounded-2xl font-semibold mb-3"
              >
                Book a Consultation
              </BookConsultButton>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 pt-2 pb-1">Menu</p>
              {primaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-stone hover:text-sage transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 pt-4 pb-1 border-t border-greige-light/80 mt-2">
                Shop &amp; marketplace
              </p>
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-neutral-600 hover:text-sage transition-colors text-sm font-medium"
                >
                  {item.isIcon ? (
                    <>
                      <img
                        src="/momade-logo.png"
                        alt=""
                        className="h-9 w-auto object-contain opacity-90"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <span>{item.name}</span>
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

