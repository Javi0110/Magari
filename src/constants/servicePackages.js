import { Monitor, Footprints, Sparkles, Palette } from 'lucide-react'

/**
 * Shared packages: `homeBlurb` + `bookCtaLabel` for Home / Services;
 * `packageIncludes` = detailed list on Services page.
 */
export const SERVICE_PACKAGES = [
  {
    name: 'Virtual Design Express',
    price: '$299',
    icon: Monitor,
    homeBlurb: 'Perfect for busy moms and anyone who wants a fast refresh with a clear plan.',
    packageIncludes: [
      'Moodboard + inspiration direction',
      'Color palette guidance',
      'Shopping list with direct links',
      'One revision',
    ],
    bookCtaLabel: 'Book Virtual Design',
  },
  {
    name: 'Staging Walkthrough Consultation',
    price: '$250',
    icon: Footprints,
    homeBlurb: 'A room-by-room plan to make your home look expensive and sell-ready.',
    packageIncludes: [
      '60–90 minute in-home walkthrough',
      'Room-by-room staging plan',
      'Decluttering + layout recommendations',
      'Quick fixes that increase value',
      'Follow-up checklist',
    ],
    bookCtaLabel: 'Book Staging Consult',
  },
  {
    name: 'Listing Prep Package',
    price: '$850',
    icon: Sparkles,
    homeBlurb: 'Hands-on styling for photos, showings, and open houses.',
    packageIncludes: [
      'Hands-on styling for photos + showings',
      'Furniture & decor placement',
      'Elevated look using what you already own',
      'Photo-day final touches',
    ],
    bookCtaLabel: 'Request Listing Prep',
  },
  {
    name: 'Full Interior Design Projects',
    price: '$1,800',
    icon: Palette,
    homeBlurb: 'For clients who want a full transformation with sourcing + execution support.',
    packageIncludes: [
      'Design plan + sourcing support',
      'Styling and space planning',
      'Decor direction and cohesion',
      'Personalized design execution plan',
    ],
    bookCtaLabel: 'Inquire About Full Design',
  },
]
