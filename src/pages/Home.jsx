import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Palette, Home, Store } from 'lucide-react'

export default function HomePage() {

  const galleryImages = [
    '/gallery/1.jpg',
    '/gallery/2.jpg',
    '/gallery/3.jpg',
    '/gallery/4.jpg',
    '/gallery/5.jpg',
    '/gallery/6.jpg',
  ]

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'Curated Decor',
      description: 'Thoughtfully selected pieces to elevate every space with character.',
      link: '/shop?category=handmade',
      bgColor: 'bg-sage/10',
      textColor: 'text-sage'
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Design Services',
      description: 'Virtual styling, shopping support, and in-person installation tailored to your home.',
      link: '/design-services',
      bgColor: 'bg-earth/10',
      textColor: 'text-earth'
    },
    {
      icon: <Store className="w-8 h-8" />,
      title: 'MOMade Marketplace',
      description: 'Support mom-made businesses. Curated with care and purpose.',
      link: '/marketplace',
      bgColor: 'bg-taupe/10',
      textColor: 'text-taupe-dark'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cream-light via-cream to-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-neutral-600 leading-tight mb-6">
                From a dream to your reality
              </h1>
              <p className="text-xl md:text-2xl text-neutral-500 mb-8 leading-relaxed">
                Handcrafted decor, personalized styling, and a marketplace celebrating mom makers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop" className="btn-primary text-center">
                  Shop Collection
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
                <Link to="/marketplace" className="btn-secondary text-center">
                  MOMade Marketplace
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-center text-neutral-600 mb-16"
          >
            What We Offer
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

      {/* Gallery Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-neutral-600 mb-4">
              Featured Work
            </h2>
            <p className="text-neutral-500 text-lg">
              Handpicked pieces and styled spaces
            </p>
          </motion.div>

          {/* Simple Grid Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow cursor-pointer bg-neutral-200"
              >
                {/* 🔌 INTEGRATION: Replace with actual images */}
                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                  Image {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

