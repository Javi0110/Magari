/** @typedef {'draft' | 'active' | 'sold' | 'archived'} RealtorListingStatus */

export const REALTOR_LISTING_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft (hidden on site)' },
  { value: 'active', label: 'Active (shown on Real Estate)' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
]
