/** Display + DB values for consultation booking */
export const BOOKING_TIMEZONE_LABEL = 'Central Time (America/Chicago)'

export const CONSULTATION_SERVICE_TYPES = [
  { value: 'virtual_design', label: 'Virtual Design' },
  { value: 'interior_design', label: 'Interior Design' },
  { value: 'staging', label: 'Home Staging' },
  { value: 'buyer', label: 'Buyer Consultation' },
  { value: 'seller', label: 'Seller Consultation' },
  { value: 'other', label: 'Other' },
]

export const CONSULTATION_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function labelForServiceType(value) {
  return CONSULTATION_SERVICE_TYPES.find((s) => s.value === value)?.label || value
}
