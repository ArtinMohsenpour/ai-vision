/**
 * Fixed website pages. Each one has its own route folder under
 * `src/app/(frontend)/[locale]/` and its own Payload global with the same slug.
 * Add a page here, add its route folder, then create a migration.
 */
export const websitePages = [
  { slug: 'home', path: '/', de: 'Startseite', en: 'Home', group: 'pages' },
  { slug: 'services-overview', path: '/services', de: 'Leistungen', en: 'Services', group: 'services' },
  { slug: 'pricing', path: '/pricing', de: 'Pakete & Preise', en: 'Packages & pricing', group: 'pages' },
  { slug: 'about', path: '/about', de: 'Über uns', en: 'About us', group: 'pages' },
  { slug: 'how-it-works', path: '/how-it-works', de: 'So arbeiten wir', en: 'How we work', group: 'pages' },
  { slug: 'faq', path: '/faq', de: 'Häufige Fragen', en: 'FAQ', group: 'pages' },
  { slug: 'contact', path: '/contact', de: 'Kontakt', en: 'Contact', group: 'pages' },
  { slug: 'impressum', path: '/impressum', de: 'Impressum', en: 'Legal notice', group: 'legal' },
  { slug: 'privacy', path: '/privacy', de: 'Datenschutz', en: 'Privacy policy', group: 'legal' },
  { slug: 'terms', path: '/terms', de: 'AGB', en: 'Terms and conditions', group: 'legal' },
] as const

export type WebsitePageSlug = (typeof websitePages)[number]['slug']
export type WebsiteLocale = 'de' | 'en'

export function websitePage(slug: string) {
  return websitePages.find((page) => page.slug === slug)
}

export const servicePath = (slug: string) => `/services/${slug}`
