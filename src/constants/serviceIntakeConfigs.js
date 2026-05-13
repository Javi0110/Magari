/** Intake forms on /services — field keys match stored answers + intakeSummary labels. */

const TIMELINE_OPTS = [
  { value: '', label: 'Select…' },
  { value: 'asap', label: 'ASAP' },
  { value: '1-4w', label: 'Within 1–4 weeks' },
  { value: '1-3m', label: '1–3 months' },
  { value: 'exploring', label: 'Just exploring' },
]

const BUDGET_OPTS = [
  { value: '', label: 'Select…' },
  { value: 'under-500', label: 'Under ~$500 (decor / small updates)' },
  { value: '500-2000', label: '$500 – $2,000' },
  { value: '2000-plus', label: '$2,000+' },
  { value: 'unsure', label: 'Not sure yet' },
]

export const SERVICE_INTAKE_CONFIGS = {
  'virtual-design': {
    title: 'Virtual Design — request',
    serviceLabel: 'Virtual Design',
    fields: [
      {
        name: 'goals',
        label: 'What do you want help with?',
        type: 'textarea',
        required: true,
        placeholder: 'Rooms, vibe, constraints, Pinterest links…',
        rows: 4,
      },
      {
        name: 'roomsFocus',
        label: 'Which spaces?',
        type: 'text',
        required: true,
        placeholder: 'e.g. Living room + nursery',
      },
      {
        name: 'styleDirection',
        label: 'Style direction (keywords)',
        type: 'text',
        required: false,
        placeholder: 'e.g. warm modern, coastal, minimal',
      },
      {
        name: 'timeline',
        label: 'Ideal timeline',
        type: 'select',
        required: true,
        options: TIMELINE_OPTS,
      },
      {
        name: 'budgetComfort',
        label: 'Rough budget comfort for furnishings / decor',
        type: 'select',
        required: true,
        options: BUDGET_OPTS,
      },
      {
        name: 'photosNote',
        label: 'Can you share photos or measurements later?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select…' },
          { value: 'yes-photos', label: 'Yes — I can send photos' },
          { value: 'yes-measure', label: 'Yes — I can share rough measurements' },
          { value: 'need-help', label: 'I’ll need guidance on what to capture' },
        ],
      },
      {
        name: 'notes',
        label: 'Anything else?',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Kids, pets, rental rules, deadlines…',
      },
    ],
  },

  'interior-design': {
    title: 'Interior Design — inquiry',
    serviceLabel: 'Interior Design',
    fields: [
      {
        name: 'scope',
        label: 'Scope',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select…' },
          { value: 'single', label: 'Single room' },
          { value: 'multi', label: 'Multiple rooms' },
          { value: 'whole-home', label: 'Whole home' },
        ],
      },
      {
        name: 'homeType',
        label: 'Home type',
        type: 'text',
        required: true,
        placeholder: 'House, condo, townhome, new build…',
      },
      {
        name: 'approxSqft',
        label: 'Approx. square footage (optional)',
        type: 'text',
        required: false,
        placeholder: 'e.g. 2,400',
      },
      {
        name: 'projectStage',
        label: 'Where are you in the process?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select…' },
          { value: 'planning', label: 'Early planning' },
          { value: 'renovation', label: 'Renovation / remodel underway' },
          { value: 'furnish', label: 'Furnishing & styling mostly' },
          { value: 'move-in', label: 'Move-in soon' },
        ],
      },
      {
        name: 'timeline',
        label: 'Ideal timeline',
        type: 'select',
        required: true,
        options: TIMELINE_OPTS,
      },
      {
        name: 'budgetRange',
        label: 'Investment range for design + furnishings (ballpark)',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select…' },
          { value: 'under-15k', label: 'Under $15k' },
          { value: '15-40k', label: '$15k – $40k' },
          { value: '40-80k', label: '$40k – $80k' },
          { value: '80k-plus', label: '$80k+' },
          { value: 'unsure', label: 'Not sure — want guidance' },
        ],
      },
      {
        name: 'inspiration',
        label: 'Inspiration (links, designers you like, etc.)',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Optional',
      },
      {
        name: 'notes',
        label: 'Project notes',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Must-haves, pain points, family needs…',
      },
    ],
  },

  'home-staging': {
    title: 'Home Staging — inquiry',
    serviceLabel: 'Home Staging',
    fields: [
      {
        name: 'listingStatus',
        label: 'Listing status',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select…' },
          { value: 'pre-list', label: 'Preparing to list' },
          { value: 'listed', label: 'Already on the market' },
          { value: 'vacant', label: 'Vacant property' },
          { value: 'occupied', label: 'Occupied / living in while selling' },
        ],
      },
      {
        name: 'targetDate',
        label: 'Target list date or photo date (if known)',
        type: 'text',
        required: false,
        placeholder: 'Month / rough date',
      },
      {
        name: 'propertyArea',
        label: 'Property city / neighborhood',
        type: 'text',
        required: true,
        placeholder: 'e.g. Georgetown, TX',
      },
      {
        name: 'approxSqft',
        label: 'Approx. square footage',
        type: 'text',
        required: false,
        placeholder: 'e.g. 2,200',
      },
      {
        name: 'roomsToStage',
        label: 'Which rooms need the most attention?',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'Living, primary, kitchen, etc.',
      },
      {
        name: 'photographer',
        label: 'Do you already have a photographer booked?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select…' },
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'need-rec', label: 'Looking for a recommendation' },
        ],
      },
      {
        name: 'notes',
        label: 'Anything else we should know?',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'HOA rules, timeline pressure, vacant dates…',
      },
    ],
  },

  package: {
    title: 'Package inquiry',
    serviceLabel: 'Package inquiry',
    fields: [
      {
        name: 'propertyArea',
        label: 'City / area',
        type: 'text',
        required: true,
        placeholder: 'Where is the project?',
      },
      {
        name: 'timeline',
        label: 'When do you want to get started?',
        type: 'select',
        required: true,
        options: TIMELINE_OPTS,
      },
      {
        name: 'mainGoal',
        label: 'What outcome are you hoping for?',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Sell faster, refresh for photos, full redesign, etc.',
      },
      {
        name: 'budgetComfort',
        label: 'Rough budget comfort (if relevant)',
        type: 'select',
        required: false,
        options: [{ value: '', label: 'Prefer not to say' }, ...BUDGET_OPTS.slice(1)],
      },
      {
        name: 'notes',
        label: 'Questions for Elena',
        type: 'textarea',
        required: false,
        rows: 3,
        placeholder: 'Optional',
      },
    ],
  },
}

export function getIntakeConfig(intakeKey) {
  return SERVICE_INTAKE_CONFIGS[intakeKey] || null
}
