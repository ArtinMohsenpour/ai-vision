/** Cache tag shared by every public CMS read; expired by Payload hooks on publish. */
export const WEBSITE_CACHE_TAG = 'website'

/** Safety net: cached pages are refreshed at least once a day (e.g. the footer year). */
export const WEBSITE_CACHE_SECONDS = 86400
