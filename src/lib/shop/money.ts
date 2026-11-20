const MAX_CENTS = 10_000_000

// German style: 1.200,50 · 350,5 · 350 (a dot is only a thousands separator before three digits).
const GERMAN = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/
// Dot decimals: 350.50 · 1.2
const DOT_DECIMAL = /^(\d+)\.(\d{1,2})$/

/** Reads a euro amount typed in the admin and returns cents, or null if it is not clear. */
export function parseEuros(input: string): number | null {
  const value = input.replace(/[€\s]/g, '')
  const match = GERMAN.exec(value) ?? DOT_DECIMAL.exec(value)
  if (!match) return null
  const euros = Number(match[1].replaceAll('.', ''))
  const cents = euros * 100 + Number((match[2] ?? '').padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents >= 1 && cents <= MAX_CENTS ? cents : null
}

/** €200 · €350.50 · 1.200,50 € — decimals only when the amount has cents. */
export function formatEuros(cents: number, locale: 'de' | 'en'): string {
  const whole = cents % 100 === 0
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100)
}
