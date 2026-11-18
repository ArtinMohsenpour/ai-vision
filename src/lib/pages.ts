/**
 * Fixed website pages. Each one has its own route folder under
 * `src/app/(frontend)/[locale]/` and its own Payload global with the same slug.
 * Add a page here, add its route folder, then create a migration.
 */
export const websitePages = [
  { slug: 'home', path: '/', de: 'Startseite', en: 'Home' },
  { slug: 'services-overview', path: '/services', de: 'Leistungen', en: 'Services' },
  { slug: 'pricing', path: '/pricing', de: 'Pakete & Preise', en: 'Packages & pricing' },
  { slug: 'about', path: '/about', de: 'Über uns', en: 'About us' },
  { slug: 'how-it-works', path: '/how-it-works', de: 'So arbeiten wir', en: 'How we work' },
  { slug: 'faq', path: '/faq', de: 'Häufige Fragen', en: 'FAQ' },
  { slug: 'contact', path: '/contact', de: 'Kontakt', en: 'Contact' },
  { slug: 'impressum', path: '/impressum', de: 'Impressum', en: 'Legal notice' },
  { slug: 'privacy', path: '/privacy', de: 'Datenschutz', en: 'Privacy policy' },
  { slug: 'terms', path: '/terms', de: 'AGB', en: 'Terms and conditions' },
] as const

export type WebsitePageSlug = (typeof websitePages)[number]['slug']
export type WebsiteLocale = 'de' | 'en'

export function websitePage(slug: string) {
  return websitePages.find((page) => page.slug === slug)
}

/** Customer login. A placeholder page until customer accounts are built (PLAN.md, phase D). */
export const LOGIN_PATH = '/login'

export const servicePath = (slug: string) => `/services/${slug}`
