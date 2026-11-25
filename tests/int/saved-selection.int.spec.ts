import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearSelection, readSelection, saveSelection } from '@/lib/shop/saved-selection'

describe('order selection saved in the browser', () => {
  beforeEach(() => {
    // Node 26 exposes its own empty localStorage global; use a fresh in-memory one per test.
    const items = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => void items.set(key, String(value)),
      removeItem: (key: string) => void items.delete(key),
      clear: () => items.clear(),
    })
  })

  it('restores the saved extras for the same service only', () => {
    saveSelection('websites', ['cms', 'chat'])
    expect(readSelection('websites', ['cms', 'chat', 'seo'])).toEqual(['cms', 'chat'])
    expect(readSelection('apps', ['cms', 'chat'])).toEqual([])
  })

  it('drops extras the owner removed since and ignores tampered values', () => {
    saveSelection('websites', ['cms', 'chat'])
    expect(readSelection('websites', ['cms'])).toEqual(['cms'])
    window.localStorage.setItem(
      'rheino-order:websites',
      '{"v":1,"extras":"<script>,cms","savedAt":' + Date.now() + '}',
    )
    expect(readSelection('websites', ['cms'])).toEqual(['cms'])
    window.localStorage.setItem('rheino-order:websites', 'not json')
    expect(readSelection('websites', ['cms'])).toEqual([])
  })

  it('forgets selections older than 30 days', () => {
    const old = Date.now() - 31 * 24 * 60 * 60 * 1000
    saveSelection('websites', ['cms'], old)
    expect(readSelection('websites', ['cms'])).toEqual([])
    expect(window.localStorage.getItem('rheino-order:websites')).toBeNull()
  })

  it('clears a selection after payment', () => {
    saveSelection('websites', ['cms'])
    clearSelection('websites')
    expect(readSelection('websites', ['cms'])).toEqual([])
  })
})
