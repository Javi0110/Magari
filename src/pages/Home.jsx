import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { ArrowRight, Palette, Home, Store, LayoutDashboard, ShoppingBag, Instagram } from 'lucide-react'

export default function HomePage() {
  const INSTAGRAM_HANDLE = 'magari.andco'
  const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

  useEffect(() => {
    const runEmbeds = () => {
      if (typeof window !== 'undefined' && window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process()
      }
    }
    let script = document.querySelector('script[src="https://www.instagram.com/embed.js"]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.addEventListener('load', runEmbeds)
      document.body.appendChild(script)
    }
    const t = setTimeout(runEmbeds, 600)
    return () => clearTimeout(t)
  }, [])

  const features = [
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Interior Design Services',
      description: 'Virtual styling, shopping support, and full-service decorating tailored to your home.',
      link: '/design-services',
      bgColor: 'bg-earth/10',
      textColor: 'text-earth'
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Shop Magari',
      description: 'Curated decor and home goods selected by Magari & Co. to bring warmth into your space.',
      link: '/shop',
      bgColor: 'bg-sage/10',
      textColor: 'text-sage'
    },
    {
      icon: <Store className="w-8 h-8" />,
      title: 'MOMade Market',
      description: 'A curated marketplace featuring products from mom-owned creative businesses.',
      link: '/momade',
      bgColor: 'bg-taupe/10',
      textColor: 'text-taupe-dark'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cream-light via-cream to-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.25em] text-neutral-500 mb-4">
                Magari &amp; Co.
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-700 leading-tight mb-4">
                Design. Curated Goods. A Marketplace for Makers.
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8 leading-relaxed max-w-xl">
                Magari &amp; Co. is a design studio and curated marketplace supporting handmade goods and creative entrepreneurs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/design-services" className="btn-primary text-center">
                  Book Design Consultation
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
                <Link to="/shop" className="btn-secondary text-center">
                  Shop Magari
                </Link>
                <Link to="/momade" className="btn-secondary text-center">
                  Explore MOMade Market
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-soft-lg bg-neutral-200"
            >
              <img 
                src="/hero-image.jpeg" 
                alt="Magari & Co. - Handcrafted decor and design"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image not found
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'flex'
                }}
              />
              {/* Fallback placeholder */}
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400" style={{ display: 'none' }}>
                <div className="text-center">
                  <Palette className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Hero Image Placeholder</p>
                  <p className="text-xs mt-2">Add hero-image.jpg to /public folder</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-sage/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-earth/10 rounded-full blur-3xl" />
      </section>

      {/* Three Pillars Section */}
      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl text-center text-neutral-600 mb-10"
          >
            Three ways to work with Magari &amp; Co.
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={feature.link} className="card group hover:scale-105 transition-transform duration-300 block h-full">
                  <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center ${feature.textColor} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-serif text-2xl text-sage-dark mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-stone mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <span className={`${feature.textColor} font-medium group-hover:underline inline-flex items-center`}>
                    Explore
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-white border-t border-cream-dark/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Instagram className="w-5 h-5 text-neutral-500" />
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Instagram
                </p>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-700 mb-2">
                Follow our design process on Instagram.
              </h2>
              <p className="text-neutral-600 text-sm md:text-base max-w-xl">
                See behind-the-scenes from installs, styling days, maker features, and the Casa Magari journey as it comes to life.
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark"
              >
                @{INSTAGRAM_HANDLE}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <div className="card p-0 overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-center gap-6 px-2 py-4">
              <div className="max-w-xl w-full mx-auto">
                <blockquote
                  className="instagram-media"
                  data-instgrm-captioned
                  data-instgrm-permalink="https://www.instagram.com/reel/DQKxIx_EZ7z/?utm_source=ig_embed&amp;utm_campaign=loading"
                  data-instgrm-version="14"
                  style={{
                    background: '#FFF',
                    border: 0,
                    borderRadius: 3,
                    boxShadow:
                      '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                    margin: 1,
                    maxWidth: 540,
                    minWidth: 326,
                    padding: 0,
                    width: '100%',
                  }}
                />
              </div>
              <div className="max-w-xl w-full mx-auto">
                <blockquote
                  className="instagram-media"
                  data-instgrm-captioned
                  data-instgrm-permalink="https://www.instagram.com/reel/DPW6TdBERrT/?utm_source=ig_embed&amp;utm_campaign=loading"
                  data-instgrm-version="14"
                  style={{
                    background: '#FFF',
                    border: 0,
                    borderRadius: 3,
                    boxShadow:
                      '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                    margin: 1,
                    maxWidth: 540,
                    minWidth: 326,
                    padding: 0,
                    width: '100%',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-center px-2 pb-4">
              <div className="max-w-xl w-full mx-auto">
                <blockquote
                  className="instagram-media"
                  data-instgrm-captioned
                  data-instgrm-permalink="https://www.instagram.com/reel/DHqyKC6Rhbs/?utm_source=ig_embed&amp;utm_campaign=loading"
                  data-instgrm-version="14"
                  style={{
                    background: '#FFF',
                    border: 0,
                    borderRadius: 3,
                    boxShadow:
                      '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
                    margin: 1,
                    maxWidth: 540,
                    minWidth: 326,
                    padding: 0,
                    width: '100%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

