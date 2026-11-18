import { servicePath, websitePage } from './pages'

/** A local path without the /de or /en prefix (next-intl adds it). Returns null when unsafe. */
export function internalHref(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const slug = value.trim()
  if (/^[a-z][a-z\d+.-]*:/i.test(slug) || /[\\\s\u0000-\u001f]/.test(slug)) return null
  const href = slug.startsWith('/') ? slug : `/${slug}`
  if (href.startsWith('//') || /^\/(de|en)(\/|$|[?#])/.test(href)) return null
  try {
    const decoded = decodeURIComponent(href)
    if (decoded.startsWith('//') || /[\\\u0000-\u001f]/.test(decoded)) return null
  } catch {
    return null
  }
  return href
}

/** An absolute http(s) URL without credentials, or null. */
export function externalHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

export type StoredLink = {
  type?: string | null
  page?: string | null
  service?: number | { slug?: string | null } | null
  path?: string | null
  url?: string | null
  newTab?: boolean | null
}

export type ResolvedLink = { href: string; external: boolean; newTab: boolean }

/** Resolves a CMS link group (see src/fields/link.ts) to a safe href, or null when it must not render. */
export function resolveLink(link: StoredLink | null | undefined): ResolvedLink | null {
  if (!link) return null
  const newTab = Boolean(link.newTab)
  switch (link.type) {
    case 'page': {
      const page = link.page ? websitePage(link.page) : undefined
      return page ? { href: page.path, external: false, newTab } : null
    }
    case 'service': {
      const slug = typeof link.service === 'object' ? link.service?.slug : null
      return slug ? { href: servicePath(slug), external: false, newTab } : null
    }
    case 'path': {
      const href = internalHref(link.path)
      return href ? { href, external: false, newTab } : null
    }
    case 'external': {
      const href = externalHref(link.url)
      return href ? { href, external: true, newTab } : null
    }
    default:
      return null
  }
}

/** Links inside rich text: local paths get the locale prefix; mailto, tel and http(s) stay as they are. */
export function richTextHref(value: unknown, locale: string): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (/^(mailto|tel):[^\s]+$/i.test(trimmed)) return trimmed
  if (trimmed.startsWith('#')) return /^#[\w-]+$/.test(trimmed) ? trimmed : null
  const local = internalHref(trimmed.startsWith('/') ? trimmed : null)
  if (local) return `/${locale}${local === '/' ? '' : local}`
  return externalHref(trimmed)
}
