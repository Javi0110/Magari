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
import HomeStagingAustinPage from './pages/HomeStagingAustin'
import InteriorDesignAustinPage from './pages/InteriorDesignAustin'
import VirtualStylingPage from './pages/VirtualStylingPage'
import AirbnbDesignPage from './pages/AirbnbDesign'
import StagingForRealtorsPage from './pages/StagingForRealtors'
import ContactPage from './pages/Contact'
import MarketplacePage from './pages/Marketplace'
import BecomeVendorPage from './pages/BecomeVendor'
import VendorProfilePage from './pages/VendorProfile'
import AboutPage from './pages/About'
import AdminPage from './pages/Admin'
import CasaMagariPage from './pages/CasaMagari'
import CheckoutSuccessPage from './pages/CheckoutSuccess'
import CheckoutCancelPage from './pages/CheckoutCancel'

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
  '/home-staging-austin': {
    title: 'Home Staging in Austin TX — Magari & Co.',
    description: 'Home staging services in Austin, TX to help your listing photograph beautifully and sell faster.'
  },
  '/interior-design-austin': {
    title: 'Interior Designer in Austin TX — Magari & Co.',
    description: 'Full-service interior design in Austin, TX for lived-in, collected homes that reflect your story.'
  },
  '/virtual-styling': {
    title: 'Virtual Interior Design Services — Magari & Co.',
    description: 'Virtual interior design and styling services with shoppable design boards you can implement from anywhere.'
  },
  '/airbnb-design': {
    title: 'Airbnb Interior Design & Styling — Magari & Co.',
    description: 'Airbnb interior design and short-term rental styling to help your listing stand out and earn 5-star reviews.'
  },
  '/staging-for-realtors': {
    title: 'Home Staging for Realtors in Austin TX — Magari & Co.',
    description: 'Dedicated home staging services and partnership program for realtors in Austin, TX who want listings that show and sell better.'
  },
  '/marketplace': {
    title: 'MOMade Marketplace — Supporting Mom Makers',
    description: 'A curated marketplace celebrating mom-made businesses. Handcrafted with love, sold with purpose.'
  },
  '/momade': {
    title: 'MOMade Market — Supporting Mom Makers',
    description: 'Explore the MOMade Market curated by Magari & Co., featuring products made by mom-owned businesses.'
  },
  '/momade-market': {
    title: 'MOMade Market — Curated Marketplace for Mom Makers',
    description: 'Shop a curated marketplace of mom-made ceramics, textiles, decor, stationery and gifts, and discover the stories behind each maker.'
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
  '/become-a-vendor': {
    title: 'Become a Vendor — MOMade Market',
    description: 'Apply to become a vendor on the MOMade Market, a curated marketplace for mom-made products and creative businesses.'
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
  },
  '/casa-magari': {
    title: 'Casa Magari — A Future Design-Forward Stay by Magari & Co.',
    description: 'Follow the behind-the-scenes journey of Casa Magari, a future Airbnb-style stay curated with mom-made pieces, local art, and slow, beautiful living.'
  }
}

function App() {
  const location = useLocation()

  // One-time: inject LocalBusiness structured data for Magari & Co. in Austin, TX
  useEffect(() => {
    const existing = document.getElementById('magari-localbusiness-schema')
    if (existing) return
    const script = document.createElement('script')
    script.id = 'magari-localbusiness-schema'
    script.type = 'application/ld+json'
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Magari & Co.',
      description:
        'Magari & Co. is a design studio and curated marketplace based in Austin, Texas, offering interior design services, styling, and mom-made home goods.',
      url: 'https://casamagari.com',
      image: 'https://casamagari.com/og-image.jpg',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        addressCountry: 'US'
      },
      areaServed: {
        '@type': 'Place',
        name: 'Austin, Texas, United States'
      },
      sameAs: [
        'https://www.instagram.com/magariandco/'
      ]
    })
    document.head.appendChild(script)
  }, [])

  // Update page title, meta tags, and Open Graph on route change
  useEffect(() => {
    const meta = pageMeta[location.pathname] || pageMeta['/']
    document.title = meta.title
    
    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description)
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      metaDescription.content = meta.description
      document.head.appendChild(metaDescription)
    }

    const canonicalBase = 'https://casamagari.com'
    const canonicalUrl = canonicalBase + (location.pathname === '/' ? '' : location.pathname)

    // Canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.rel = 'canonical'
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', canonicalUrl)

    // Open Graph tags
    const ensureOg = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    ensureOg('og:title', meta.title)
    ensureOg('og:description', meta.description)
    ensureOg('og:type', location.pathname === '/' ? 'website' : 'article')
    ensureOg('og:url', canonicalUrl)
    ensureOg('og:image', 'https://casamagari.com/og-image.jpg')

    // Twitter Card
    let twitterCard = document.querySelector('meta[name="twitter:card"]')
    if (!twitterCard) {
      twitterCard = document.createElement('meta')
      twitterCard.name = 'twitter:card'
      document.head.appendChild(twitterCard)
    }
    twitterCard.setAttribute('content', 'summary_large_image')

    let twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta')
      twitterTitle.name = 'twitter:title'
      document.head.appendChild(twitterTitle)
    }
    twitterTitle.setAttribute('content', meta.title)

    let twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta')
      twitterDescription.name = 'twitter:description'
      document.head.appendChild(twitterDescription)
    }
    twitterDescription.setAttribute('content', meta.description)

    let twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (!twitterImage) {
      twitterImage = document.createElement('meta')
      twitterImage.name = 'twitter:image'
      document.head.appendChild(twitterImage)
    }
    twitterImage.setAttribute('content', 'https://casamagari.com/og-image.jpg')

    // Scroll to top on route change
    window.scrollTo(0, 0)

    // 🔌 INTEGRATION: Track page views
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
      })
    }
    
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
          {/* SEO landing pages for design services */}
          <Route path="/home-staging-austin" element={<HomeStagingAustinPage />} />
          <Route path="/interior-design-austin" element={<InteriorDesignAustinPage />} />
          <Route path="/virtual-styling" element={<VirtualStylingPage />} />
          <Route path="/airbnb-design" element={<AirbnbDesignPage />} />
          <Route path="/staging-for-realtors" element={<StagingForRealtorsPage />} />

          {/* MOMade market routes */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/momade" element={<MarketplacePage />} />
          <Route path="/momade-market" element={<MarketplacePage />} />
          <Route path="/momade/shop" element={<MarketplacePage />} />
          <Route path="/momade/become-a-vendor" element={<MarketplacePage />} />
          <Route path="/momade/vendor-login" element={<MarketplacePage />} />
          <Route path="/become-a-vendor" element={<BecomeVendorPage />} />
          <Route path="/maker/:slug" element={<VendorProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/casa-magari" element={<CasaMagariPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
          
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

