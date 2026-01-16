import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, ShoppingBag, Hammer, X, Sparkles } from 'lucide-react'
import {
  VirtualStylingForm,
  ShoppingStylingForm,
  DecoratingInstallationForm
} from '../components/ServiceForms'

const SERVICES = [
  {
    id: 'virtual',
    title: 'Virtual Styling',
    description:
      'Design and decorate your space from anywhere. Receive a digital moodboard with clickable shopping links in 4–6 business days.',
    icon: Palette,
    highlights: [
      'Personalized digital moodboard',
      'Product list with direct links',
      'Style and color palette guide',
      'Email delivery in 5 business days'
    ],
    cta: 'Start Your Virtual Project'
  },
  {
    id: 'shopping',
    title: 'Shopping & Styling Service',
    description:
      'We handle finding, selecting, and purchasing everything needed for your space. You can choose to approve each purchase or let us handle everything. We send you a moodboard proposal and product list. Once approved, we make the purchases.',
    icon: ShoppingBag,
    highlights: [
      'Moodboard and product list',
      'Purchase and shipping management',
      'Two options: pre-approval or complete purchase',
      'Styling notes and installation guide'
    ],
    cta: 'Book Shopping & Styling'
  },
  {
    id: 'installation',
    title: 'Decorating + Installation',
    description:
      'Complete in-person service. We visit your space, design, purchase everything needed, and install. Perfect for complete transformations that require professional hands. Includes paint, furniture, art, murals, and everything you need.',
    icon: Hammer,
    highlights: [
      'In-person space visit',
      'Complete design and purchase',
      'Professional installation',
      'Post-installation follow-up'
    ],
    cta: 'Schedule In-Person Service'
  }
]

export default function DesignServicesPage() {
  const [expandedCard, setExpandedCard] = useState(null)
  const [activeService, setActiveService] = useState(null)

  const handleOpen = (serviceId) => {
    setActiveService(serviceId)
  }

  const handleClose = () => {
    setActiveService(null)
  }

  const renderActiveForm = () => {
    switch (activeService) {
      case 'virtual':
        return <VirtualStylingForm onClose={handleClose} />
      case 'shopping':
        return <ShoppingStylingForm onClose={handleClose} />
      case 'installation':
        return <DecoratingInstallationForm onClose={handleClose} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 text-sm font-medium text-sage mb-4">
            <Sparkles className="w-5 h-5" />
            <span>Magari &amp; Co. Bespoke Design Services</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-700 leading-tight max-w-4xl mx-auto">
            Tailored interiors and styling for every stage of your home story
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto mt-6">
            Choose the experience that fits your project — from virtual styling with shoppable guides to full-service decorating and installation in the San Juan and greater Austin areas.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => {
            const Icon = service.icon
            const isExpanded = expandedCard === service.id
            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-soft hover:shadow-soft-lg transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-sage/10 text-sage flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-3xl text-neutral-700 mb-4">{service.title}</h2>
                <p className="text-neutral-600 mb-6 text-sm leading-relaxed">{service.description}</p>

                <div className={`space-y-3 mb-6 transition-[max-height] duration-300 ${isExpanded ? 'max-h-96' : 'max-h-24 overflow-hidden'}`}>
                  {service.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-3 text-sm text-neutral-600">
                      <span className="mt-1 block w-2 h-2 rounded-full bg-sage" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-sm text-sage cursor-pointer mb-6">
                  <button
                    type="button"
                    onClick={() => setExpandedCard(isExpanded ? null : service.id)}
                    className="underline underline-offset-4"
                  >
                    {isExpanded ? 'Show less' : 'See details'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpen(service.id)}
                  className="btn-primary w-full"
                >
                  {service.cta}
                </button>
              </motion.article>
            )
          })}
        </section>
      </div>

      {activeService ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative w-full h-full max-h-[90vh] max-w-6xl mx-auto px-4 py-10">
            <div className="absolute top-6 right-6 z-20">
              <button
                type="button"
                onClick={handleClose}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/90 text-neutral-500 hover:text-sage shadow-soft"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative bg-white rounded-[28px] shadow-soft-lg p-6 md:p-10 overflow-y-auto max-h-full">
              {renderActiveForm()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
