import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

// Layout Components
import Header from './components/Header'
import Footer from './components/Footer'
import Cart from './components/Cart'

// Page Components
import HomePage from './pages/Home'
import ShopPage from './pages/Shop'
import DesignServicesPage from './pages/DesignServices'
import ContactPage from './pages/Contact'
import MarketplacePage from './pages/Marketplace'
import VendorProfilePage from './pages/VendorProfile'
import AboutPage from './pages/About'
import AdminPage from './pages/Admin'

// SEO Meta Tags by Route
const pageMeta = {
  '/': {
    title: 'Magari & Co. — From a dream to your reality',
    description: 'Handmade decor, virtual styling, and curated marketplace supporting mom makers. Transform your space with beautiful, accessible design.'
  },
  '/shop': {
    title: 'Shop Magari — Magari & Co.',
    description: 'Browse our collection of handcrafted decor and curated home pieces. Unique, artisan items shipped to USA & PR.'
  },
  '/design-services': {
    title: 'Design Services — Magari & Co.',
    description: 'Transform your home from anywhere. Virtual consultations, shopping & styling, and personalized decorating + installation services.'
  },
  '/marketplace': {
    title: 'MOMade Marketplace — Supporting Mom Makers',
    description: 'A curated marketplace celebrating mom-made businesses. Handcrafted with love, sold with purpose.'
  },
  '/about': {
    title: 'About — Magari & Co.',
    description: 'Learn about Elena and the story behind Magari & Co. — creating accessible design and supporting mom makers.'
  },
  '/contact': {
    title: 'Contact — Magari & Co.',
    description: 'Reach out to Magari & Co. for questions, collaborations, or styling support.'
  },
  '/admin': {
    title: 'Admin Dashboard — Magari & Co.',
    description: 'Admin portal for Magari & Co.'
  }
}

function App() {
  const location = useLocation()

  // Update page title and meta tags on route change
  useEffect(() => {
    const meta = pageMeta[location.pathname] || pageMeta['/']
    document.title = meta.title
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description)
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      metaDescription.content = meta.description
      document.head.appendChild(metaDescription)
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', meta.title)
    }

    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', meta.description)
    }

    // Scroll to top on route change
    window.scrollTo(0, 0)

    // 🔌 INTEGRATION: Track page views
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
      })
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView')
    }
  }, [location])

  // Don't show Header/Footer on admin page
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="App">
      {!isAdminPage && <Header />}
      
      <Cart />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/design-services" element={<DesignServicesPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/maker/:slug" element={<VendorProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {!isAdminPage && <Footer />}
    </div>
  )
}

// 404 Page Component
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12">
      <div className="text-center px-4">
        <h1 className="font-serif text-6xl md:text-8xl text-neutral-600 mb-4">
          404
        </h1>
        <p className="text-2xl text-neutral-600 mb-8">
          Page not found
        </p>
        <a href="/" className="btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default App

