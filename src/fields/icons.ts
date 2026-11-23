/** Outline icons editors can pick for cards (paths: src/components/site/site-icon.tsx). */
export const SITE_ICONS = {
  website: 'Website (browser window)',
  speed: 'Speed (lightning)',
  mobile: 'Smartphone',
  edit: 'Edit (pencil)',
  search: 'Search',
  shield: 'Protection (shield)',
  lock: 'Lock',
  language: 'Languages (globe)',
  accessibility: 'Accessibility',
  design: 'Design (palette)',
  cms: 'Content management',
  payment: 'Payment (card)',
  chatbot: 'Chat',
  sparkles: 'AI (sparkles)',
  automation: 'Automation (workflow)',
  analytics: 'Statistics (bars)',
  code: 'Code',
  server: 'Hosting (server)',
  calendar: 'Calendar',
  clock: 'Clock',
  mail: 'Email',
  location: 'Location (pin)',
  support: 'Support (headset)',
  people: 'Person',
  shop: 'Shop',
  restaurant: 'Restaurant (cutlery)',
  tools: 'Trades (wrench)',
  briefcase: 'Office (briefcase)',
  launch: 'Launch (arrow)',
  check: 'Check mark',
} as const

export type SiteIconName = keyof typeof SITE_ICONS

export const siteIconOptions = Object.entries(SITE_ICONS).map(([value, label]) => ({
  value,
  label,
}))

export const isSiteIcon = (value: unknown): value is SiteIconName =>
  typeof value === 'string' && Object.hasOwn(SITE_ICONS, value)
