import { describe, expect, it } from 'vitest'

import { resolveLink, richTextHref } from '@/lib/links'
import { mediaPath } from '@/lib/media-url'

describe('CMS links', () => {
  it('resolves website pages, service pages and external URLs', () => {
    expect(resolveLink({ type: 'internal', page: 'about' })?.href).toBe('/about')
    expect(resolveLink({ type: 'internal', page: 'home' })?.href).toBe('/')
    expect(resolveLink({ type: 'internal', service: { slug: 'websites' } })?.href).toBe('/services/websites')
    expect(resolveLink({ type: 'external', url: 'https://example.com', newTab: true })).toEqual({
      href: 'https://example.com/',
      external: true,
      newTab: true,
    })
  })

  it('drops unsafe or incomplete links', () => {
    expect(resolveLink({ type: 'internal', page: 'unknown' })).toBeNull()
    expect(resolveLink({ type: 'internal', service: 4 })).toBeNull()
    expect(resolveLink({ type: 'internal' })).toBeNull()
    expect(resolveLink({ type: 'page', page: 'about' })).toBeNull()
    expect(resolveLink({ type: 'external', url: 'javascript:alert(1)' })).toBeNull()
    expect(resolveLink({ type: 'external', url: 'https://user:pass@example.com' })).toBeNull()
  })

  it('prefixes local rich-text links with /en only for English', () => {
    expect(richTextHref('/about', 'en')).toBe('/en/about')
    expect(richTextHref('/', 'en')).toBe('/en')
    expect(richTextHref('/about', 'de')).toBe('/about')
    expect(richTextHref('/', 'de')).toBe('/')
    expect(richTextHref('mailto:hello@example.com', 'de')).toBe('mailto:hello@example.com')
    expect(richTextHref('https://example.com', 'de')).toBe('https://example.com/')
    expect(richTextHref('javascript:alert(1)', 'de')).toBeNull()
  })

  it('renders only media files from this site, as relative paths', () => {
    const origin = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').origin
    expect(mediaPath(`${origin}/api/media/file/photo.webp`)).toBe('/api/media/file/photo.webp')
    expect(mediaPath('/api/media/file/logo.svg')).toBe('/api/media/file/logo.svg')
    expect(mediaPath('https://evil.example/api/media/file/photo.webp')).toBeNull()
    expect(mediaPath(`${origin}/admin`)).toBeNull()
    expect(mediaPath(null)).toBeNull()
  })
})
