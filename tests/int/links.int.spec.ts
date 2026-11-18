import { describe, expect, it } from 'vitest'

import { resolveLink, richTextHref } from '@/lib/links'

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
})
