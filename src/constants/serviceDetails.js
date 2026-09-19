import { Monitor, Palette, Footprints, Tag } from 'lucide-react'

/**
 * High-level service landing content for /services/:slug
 */
export const SERVICE_DETAILS = {
  'interior-design': {
    slug: 'interior-design',
    title: 'Interior Design',
    eyebrow: 'Full-home & room design',
    summary:
      'Cohesive interiors that feel intentional, warm, and built for real life — not a showroom you cannot live in.',
    heroBody:
      'Interior Design with Magari & Co. is hands-on creative direction for clients who want a home that looks elevated and still works for family, guests, and everyday routines. We plan layout, color, materials, and styling so every room supports how you actually live.',
    bestFor: [
      'Whole-home or multi-room refreshes',
      'New builds and move-ins that need a clear plan',
      'Clients who want sourcing help, not just moodboards',
      'Spaces that should feel personal, not catalog-perfect',
    ],
    includes: [
      'Design concept and direction for your space',
      'Layout and furniture planning',
      'Palette, finishes, and material guidance',
      'Sourcing support and styling recommendations',
      'A clear path from vision to install-ready decisions',
    ],
    howItWorks: [
      'Share photos, floor plans, and what is not working today.',
      'We translate your lifestyle into a design plan you can follow.',
      'We refine sourcing and styling until the room feels like you.',
    ],
    intakeKey: 'interior-design',
    ctaLabel: 'Inquire — Interior Design',
    icon: Palette,
    relatedPackages: ['Full Interior Design Projects'],
  },
  'virtual-design': {
    slug: 'virtual-design',
    title: 'Virtual Design',
    eyebrow: 'Remote styling & shopping plans',
    summary:
      'A designer’s eye and a clear plan — delivered digitally so you can refresh a room without in-person meetings.',
    heroBody:
      'Virtual Design is ideal when you want professional direction fast: moodboards, layout ideas, and a shopping list with links you can use immediately. Perfect for busy schedules, rentals, nurseries, and single-room makeovers.',
    bestFor: [
      'Nurseries, bedrooms, living rooms, and rentals',
      'Quick refreshes before you buy more furniture',
      'Clients outside Austin or with limited time',
      'Anyone who wants a plan before spending on decor',
    ],
    includes: [
      'Curated moodboard and style direction',
      'Layout suggestions for your photos or floor plan',
      'Color palette guidance',
      'Shopping list with product links',
      'One revision round on the plan',
    ],
    howItWorks: [
      'Upload photos (and a floor plan if you have one).',
      'We send a focused virtual design package you can execute yourself.',
      'Shop from the list — or book a consult if you want more support.',
    ],
    intakeKey: 'virtual-design',
    ctaLabel: 'Request Virtual Design',
    icon: Monitor,
    relatedPackages: ['Virtual Design Express'],
  },
  'home-staging': {
    slug: 'home-staging',
    title: 'Home Staging',
    eyebrow: 'Sell-ready styling',
    summary:
      'Strategic styling that helps buyers fall in love — and helps sellers win showings, photos, and offers.',
    heroBody:
      'Home Staging with Magari is not “decorating for fun.” It is intentional placement, declutter direction, and photo-ready polish so listings look expensive, spacious, and move-in ready. We work with what you own when possible and call out the quick fixes that raise perceived value.',
    bestFor: [
      'Homes going on the market soon',
      'Realtors who need listings that photograph beautifully',
      'Sellers who want a room-by-room action plan',
      'Open houses and photo day prep',
    ],
    includes: [
      'Walkthrough-based staging recommendations',
      'Declutter and layout priorities by room',
      'Styling for photos, showings, and open houses',
      'Quick-fix guidance that increases perceived value',
      'Optional listing-prep packages for hands-on install',
    ],
    howItWorks: [
      'Book a staging consult or listing-prep package.',
      'We map what to keep, move, edit, or elevate.',
      'Your home shows cleaner, brighter, and more intentional.',
    ],
    intakeKey: 'home-staging',
    ctaLabel: 'Inquire — Home Staging',
    icon: Footprints,
    relatedPackages: ['Staging Walkthrough Consultation', 'Listing Prep Package'],
  },
  packages: {
    slug: 'packages',
    title: 'Packages & Pricing',
    eyebrow: 'Clear starting points',
    summary:
      'Transparent packages so you can choose a path — from a fast virtual refresh to full interior design or listing prep.',
    heroBody:
      'Every Magari package is written in plain English: what you get, what it starts at, and who it is for. Pick the package that matches your season, then fill a short intake so we can confirm fit and next steps.',
    bestFor: [
      'Clients who want pricing clarity before booking',
      'Projects with a defined budget band',
      'Anyone comparing virtual vs in-person options',
      'Sellers and homeowners who want a packaged deliverable',
    ],
    includes: [
      'Virtual Design Express — remote plan + shopping list',
      'Staging Walkthrough Consultation — room-by-room sell plan',
      'Listing Prep Package — hands-on styling for photos & showings',
      'Full Interior Design Projects — transformation with sourcing support',
      'Add-ons available (palette plans, extra rooms, photo-day support)',
    ],
    howItWorks: [
      'Browse packages on this page or the main Services hub.',
      'Request the package that fits — intake takes a few minutes.',
      'We confirm scope, timing, and any add-ons before you commit.',
    ],
    intakeKey: 'package',
    ctaLabel: 'Ask about packages',
    icon: Tag,
    relatedPackages: null, // show all on packages page
  },
}

export const SERVICE_DETAIL_SLUGS = Object.keys(SERVICE_DETAILS)
