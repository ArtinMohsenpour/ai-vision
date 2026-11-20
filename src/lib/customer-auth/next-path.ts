const BLOCKED_FIRST_SEGMENTS = new Set(['en', 'de', 'api', 'admin', '_next'])

/**
 * Where to send a customer after login or email verification. Only an unprefixed path on this
 * site is accepted (the language prefix is added by `localizedPath`), never another origin.
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500) return null
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return null
  const first = value.slice(1).split(/[/?#]/, 1)[0]
  return BLOCKED_FIRST_SEGMENTS.has(first) ? null : value
}
