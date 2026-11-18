const MEDIA_PATH = '/api/media/file/'
const SITE_ORIGIN = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').origin

/**
 * Payload returns absolute URLs built from NEXT_PUBLIC_SERVER_URL. Only files from this site's
 * media route are rendered, as relative paths so they work on any host (preview, staging).
 */
export function mediaPath(url: unknown): string | null {
  if (typeof url !== 'string' || !url) return null
  try {
    const parsed = new URL(url, SITE_ORIGIN)
    if (parsed.origin !== SITE_ORIGIN || !parsed.pathname.startsWith(MEDIA_PATH)) return null
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return null
  }
}
