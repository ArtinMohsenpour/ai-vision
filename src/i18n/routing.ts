import { defineRouting } from 'next-intl/routing'

/**
 * German is the default and has no URL prefix (/about); English lives under /en (/en/about).
 * The language is never guessed from the browser or a cookie: / is always German.
 * Old /de/... URLs redirect to the unprefixed path.
 */
export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
})

export type Locale = (typeof routing.locales)[number]

/** The public path of a page in one language, e.g. ('en', '/about') → '/en/about', ('de', '/') → '/'. */
export const localizedPath = (locale: string, path: string) =>
  locale === routing.defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`
