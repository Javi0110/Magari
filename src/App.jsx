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
  '/design-services/home-staging': {
    title: 'Home Staging — Design Services — Magari & Co.',
    description: 'Home staging services to help your property show its best. Styling, decor, and layout optimized for buyers.'
  },
  '/design-services/interior-design': {
    title: 'Interior Design — Magari & Co.',
    description: 'Full-service interior design support to transform your home with cohesive, intentional design.'
  },
  '/design-services/virtual-styling': {
    title: 'Virtual Styling — Magari & Co.',
    description: 'Virtual interior styling with shoppable guides so you can execute the look at your own pace.'
  },
  '/marketplace': {
    title: 'MOMade Marketplace — Supporting Mom Makers',
    description: 'A curated marketplace celebrating mom-made businesses. Handcrafted with love, sold with purpose.'
  },
  '/momade': {
    title: 'MOMade Market — Supporting Mom Makers',
    description: 'Explore the MOMade Market curated by Magari & Co., featuring products made by mom-owned businesses.'
  },
  '/momade/shop': {
    title: 'Shop the MOMade Market — Magari & Co.',
    description: 'Shop mom-made products across ceramics, textiles, decor, art and more from our approved makers.'
  },
  '/momade/become-a-vendor': {
    title: 'Become a Vendor — MOMade Market',
    description: 'Apply to sell your mom-made products on the MOMade Market. Learn how the process and commission structure work.'
  },
  '/momade/vendor-login': {
    title: 'Vendor Login — MOMade Market',
    description: 'Access your MOMade vendor dashboard to manage products, view sales, and update your profile.'
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

  return (
    <div className="App">
      <Header />
      
      <Cart />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/design-services" element={<DesignServicesPage />} />
          {/* Design services sub-routes (reuse main page for now) */}
          <Route path="/design-services/home-staging" element={<DesignServicesPage />} />
          <Route path="/design-services/interior-design" element={<DesignServicesPage />} />
          <Route path="/design-services/virtual-styling" element={<DesignServicesPage />} />

          {/* MOMade market routes */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/momade" element={<MarketplacePage />} />
          <Route path="/momade/shop" element={<MarketplacePage />} />
          <Route path="/momade/become-a-vendor" element={<MarketplacePage />} />
          <Route path="/momade/vendor-login" element={<MarketplacePage />} />
          <Route path="/maker/:slug" element={<VendorProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      <Footer />
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

