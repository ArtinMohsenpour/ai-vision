import type { GlobalConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '@/access'
import { sectionsField } from '@/blocks/layouts'
import { pageHeadingFields } from '@/fields/heading'
import { seoFields } from '@/fields/seo'
import { protectGlobalDrafts } from '@/hooks/protect-drafts'
import { ADMIN_GROUPS, CMS_VERSION_LIMIT } from '@/lib/cms'
import { websitePages } from '@/lib/pages'

/**
 * One global per fixed website page (see src/lib/pages.ts), each with its own editor in the
 * sidebar. They share the same model: heading, page sections and SEO, with drafts and versions.
 */
export const PageGlobals: GlobalConfig[] = websitePages.map(({ slug, path, en }) => ({
  slug,
  label: slug === 'services-overview' ? 'Services overview' : en,
  admin: {
    group: ADMIN_GROUPS[websitePages.find((page) => page.slug === slug)!.group],
    description: `The page at /de${path === '/' ? '' : path} and /en${path === '/' ? '' : path}. Heading, page sections and SEO. Save a draft while editing, then publish. Translate with the locale selector.`,
  },
  access: { read: publishedOrAdmin, update: isAdmin, readVersions: isAdmin },
  hooks: { beforeOperation: [protectGlobalDrafts] },
  versions: { drafts: true, max: CMS_VERSION_LIMIT },
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'Heading', fields: pageHeadingFields },
        { label: 'Content', fields: [sectionsField()] },
        { label: 'SEO', fields: seoFields },
      ],
    },
  ],
}))
