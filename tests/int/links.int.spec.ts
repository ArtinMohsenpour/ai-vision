import { describe, expect, it } from 'vitest'

import { resolveLink, richTextHref } from '@/lib/links'
import { mediaPath } from '@/lib/media-url'

describe('CMS links', () => {
  it('resolves website pages, service pages, paths and external URLs', () => {
    expect(resolveLink({ type: 'page', page: 'about' })?.href).toBe('/about')
    expect(resolveLink({ type: 'page', page: 'home' })?.href).toBe('/')
    expect(resolveLink({ type: 'service', service: { slug: 'websites' } })?.href).toBe('/services/websites')
    expect(resolveLink({ type: 'path', path: '/contact#form' })?.href).toBe('/contact#form')
    expect(resolveLink({ type: 'external', url: 'https://example.com', newTab: true })).toEqual({
      href: 'https://example.com/',
      external: true,
      newTab: true,
    })
  })

  it('drops unsafe or incomplete links', () => {
    expect(resolveLink({ type: 'page', page: 'unknown' })).toBeNull()
    expect(resolveLink({ type: 'service', service: 4 })).toBeNull()
    expect(resolveLink({ type: 'path', path: '//evil.example' })).toBeNull()
    expect(resolveLink({ type: 'path', path: 'javascript:alert(1)' })).toBeNull()
    expect(resolveLink({ type: 'path', path: '/de/about' })).toBeNull()
    expect(resolveLink({ type: 'external', url: 'javascript:alert(1)' })).toBeNull()
    expect(resolveLink({ type: 'external', url: 'https://user:pass@example.com' })).toBeNull()
  })

  it('prefixes local rich-text links with the locale', () => {
    expect(richTextHref('/about', 'en')).toBe('/en/about')
    expect(richTextHref('/', 'de')).toBe('/de')
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
