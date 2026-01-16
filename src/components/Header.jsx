import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { openCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  const navigation = [
    { name: 'Shop Magari', href: '/shop' },
    { name: 'Design Services', href: '/design-services' },
    { name: 'Marketplace', href: '/marketplace', isIcon: true },
    { name: 'About', href: '/about' },
  ]

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
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={item.isIcon 
                  ? "flex items-start justify-center transition-opacity hover:opacity-80 pt-4" 
                  : "text-stone hover:text-sage transition-colors font-medium tracking-wide flex items-center"
                }
                aria-label={item.isIcon ? "Marketplace" : item.name}
              >
                {item.isIcon ? (
                  <>
                    <img 
                      src="/momade-logo.png" 
                      alt="MOMade Marketplace" 
                      className="h-16 md:h-20 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block'
                        }
                      }}
                    />
                    <span className="hidden text-stone hover:text-sage transition-colors font-medium tracking-wide">
                      Marketplace
                    </span>
                  </>
                ) : (
                  item.name
                )}
              </Link>
            ))}
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
                      <span>Marketplace</span>
                    </>
                  ) : (
                    item.name
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

