/** Cache tag shared by every public CMS read; expired by Payload hooks on publish. */
export const WEBSITE_CACHE_TAG = 'website'

/** Safety net: cached pages are refreshed at least once a day (e.g. the footer year). */
export const WEBSITE_CACHE_SECONDS = 86400

/**
 * Part of every cache key. Next keeps its data cache in .next/cache across builds, so without this
 * a deploy could serve CMS data cached before a migration changed its shape (set in next.config).
 */
export const WEBSITE_CACHE_BUILD = process.env.WEBSITE_CACHE_BUILD ?? 'dev'
