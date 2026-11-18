import type { ImageUploadFormatOptions } from 'payload'

/**
 * Upload policy for public website images:
 * - Accepted: PNG, JPEG, WebP and SVG. Payload checks the file content, not just the name, and
 *   rejects SVGs with scripts, event handlers or embedded content.
 * - PNG and JPEG are converted to WebP on upload; only the WebP is stored. WebP keeps
 *   transparency and is about 25–35 % smaller than JPEG at the same visual quality.
 * - Large photos are scaled down to at most 2560 px; metadata such as GPS location is removed.
 * - SVG is stored as uploaded (vector, no conversion).
 */
export const MEDIA_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export const webp: ImageUploadFormatOptions = {
  format: 'webp',
  options: { quality: 82, alphaQuality: 100, effort: 4, smartSubsample: true },
}

export const MAX_IMAGE_SIDE = 2560

/** Responsive widths generated for every raster image (all WebP). */
export const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400 },
  { name: 'card', width: 768 },
  { name: 'wide', width: 1600 },
] as const

/**
 * Media responses: never sniff a different type, and sandbox the file if opened directly, so
 * even a stored active file cannot run script on this origin. Images still embed normally.
 * Files change only on re-upload, so browsers may cache them for a day.
 */
export function mediaResponseHeaders({ headers }: { headers: Headers }) {
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Content-Security-Policy', "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'")
  headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  return headers
}
