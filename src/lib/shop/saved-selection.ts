import { parseExtraIds } from './pricing'

/**
 * The extras a visitor picked on an order page, kept in this browser only so a sign-in, sign-up
 * or a later visit does not lose them. Only extra IDs are stored (no personal data, no prices),
 * and they are checked against the current offer whenever they are read back.
 */
const PREFIX = 'rheino-order:'
const MAX_AGE = 30 * 24 * 60 * 60 * 1000

type Saved = { v: 1; extras: string; savedAt: number }

export function saveSelection(slug: string, extraIds: readonly string[], now = Date.now()) {
  try {
    const value: Saved = { v: 1, extras: extraIds.join(','), savedAt: now }
    window.localStorage.setItem(PREFIX + slug, JSON.stringify(value))
  } catch {
    // Private mode or blocked storage: the selection still lives in the URL.
  }
}

export function readSelection(slug: string, known: readonly string[], now = Date.now()): string[] {
  try {
    const raw = window.localStorage.getItem(PREFIX + slug)
    if (!raw || raw.length > 4000) return []
    const saved = JSON.parse(raw) as Partial<Saved>
    if (saved?.v !== 1 || typeof saved.savedAt !== 'number' || now - saved.savedAt > MAX_AGE) {
      window.localStorage.removeItem(PREFIX + slug)
      return []
    }
    return parseExtraIds(saved.extras).filter((id) => known.includes(id))
  } catch {
    return []
  }
}

export function clearSelection(slug: string) {
  try {
    window.localStorage.removeItem(PREFIX + slug)
  } catch {
    // Nothing to clear.
  }
}
