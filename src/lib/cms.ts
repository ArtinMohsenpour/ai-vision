/** Versions kept per document or global. Older ones are removed when a new version is saved. */
export const CMS_VERSION_LIMIT = 25

/**
 * Admin sidebar groups. Payload lists groups that contain collections first,
 * so the order of `collections` in payload.config.ts sets the group order.
 */
export const ADMIN_GROUPS = {
  pages: 'Pages',
  services: 'Services',
  legal: 'Legal',
  settings: 'Site settings',
  content: 'Media',
  shop: 'Shop',
  admin: 'Admin',
} as const
