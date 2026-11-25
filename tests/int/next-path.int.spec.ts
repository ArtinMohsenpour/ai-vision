import { describe, expect, it } from 'vitest'

import { safeNextPath } from '@/lib/customer-auth/next-path'

describe('safe next path after login', () => {
  it('accepts paths on this site', () => {
    expect(safeNextPath('/services/websites/order?extras=a,b')).toBe(
      '/services/websites/order?extras=a,b',
    )
    expect(safeNextPath('/account/orders/12')).toBe('/account/orders/12')
  })

  it('rejects other sites, locale prefixes, admin and odd input', () => {
    for (const value of [
      '//evil.test',
      '/\\evil.test',
      'https://evil.test',
      'services',
      '/en/account',
      '/de/account',
      '/api/users',
      '/admin',
      '/_next/static',
      `/${'a'.repeat(501)}`,
      '/account\n',
      '',
      undefined,
      42,
    ])
      expect(safeNextPath(value)).toBeNull()
  })
})
