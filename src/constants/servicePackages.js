import { Monitor, Footprints, Sparkles, Palette } from 'lucide-react'

/** Shared package cards for Home + Services */
export const SERVICE_PACKAGES = [
  {
    name: 'Virtual Design Express',
    price: '$299',
    tag: 'Remote · fast turnaround',
    icon: Monitor,
    bullets: [
      'Direction board + shoppable links',
      'One revision pass',
      'Best for a single room reset',
    ],
  },
  {
    name: 'Staging Walkthrough Consultation',
    price: '$250',
    tag: 'On-site or virtual walkthrough',
    icon: Footprints,
    bullets: [
      'Room-by-room priorities',
      'Photo-day punch list',
      'Vendor-neutral — act on it yourself or hire out',
    ],
  },
  {
    name: 'Listing Prep Package',
    price: '$850',
    tag: 'Get market-ready',
    icon: Sparkles,
    bullets: [
      'Seller prep roadmap',
      'Show-ready styling notes',
      'Built to support a clean launch week',
    ],
  },
  {
    name: 'Full Interior Design Projects',
    price: '$1,800',
    tag: 'Starting investment',
    icon: Palette,
    bullets: [
      'Concept through install support',
      'Layouts, finishes, sourcing',
      'Primary homes + select short-term rentals',
    ],
  },
]
