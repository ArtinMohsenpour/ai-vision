import type { GlobalConfig, Tab } from 'payload'

import { isAdmin, publishedOrAdmin } from '@/access'
import { sectionsField } from '@/blocks/layouts'
import { pageHeadingFields } from '@/fields/heading'
import { seoFields } from '@/fields/seo'
import { protectGlobalDrafts } from '@/hooks/protect-drafts'
import { revalidateGlobal } from '@/hooks/revalidate'
import { localizedPath } from '@/i18n/routing'
import { ADMIN_GROUPS, CMS_VERSION_LIMIT } from '@/lib/cms'
import { websitePages, type WebsitePageSlug } from '@/lib/pages'

// Sidebar labels where the admin needs more context than the public page name.
const adminLabels: Partial<Record<WebsitePageSlug, string>> = {
  'services-overview': 'Services overview',
  impressum: 'Legal notice (Impressum)',
  terms: 'Terms and conditions (AGB)',
}

const headingTab = (slug: WebsitePageSlug): Tab =>
  slug === 'home'
    ? {
        label: 'Hero',
        description: 'Published services surround the Rheino wordmark. The eyebrow appears beneath the name and buttons appear at the foot of the landscape.',
        fields: [
          ...pageHeadingFields,
          {
            name: 'heroArtwork',
            label: 'Hero artwork',
            type: 'upload',
            relationTo: 'media',
            localized: true,
            admin: { description: 'Optional. Leave empty to use the Rhine landscape behind the wordmark and service links.' },
          },
        ],
      }
    : { label: 'Heading', fields: pageHeadingFields }

/**
 * One global per fixed website page (see src/lib/pages.ts), each with its own editor in the
 * "Pages" sidebar group. They share one model: heading (Hero on Home), page sections and SEO,
 * with drafts and versions.
 */
export const PageGlobals: GlobalConfig[] = websitePages.map(({ slug, path, en }) => {
  const url = path === '/' ? '' : path
  return {
    slug,
    label: adminLabels[slug] ?? en,
    admin: {
      group: ADMIN_GROUPS.pages,
      description: `Page at ${url} (German) and ${localizedPath('en', url)} (English). Save a draft while editing, then publish. Switch the language at the top.`,
    },
    access: { read: publishedOrAdmin, update: isAdmin, readVersions: isAdmin },
    hooks: { beforeOperation: [protectGlobalDrafts], afterChange: [revalidateGlobal] },
    versions: { drafts: true, max: CMS_VERSION_LIMIT },
    fields: [
      {
        type: 'tabs',
        tabs: [
          headingTab(slug),
          { label: 'Content', fields: [sectionsField()] },
          { label: 'SEO', fields: seoFields },
        ],
      },
    ],
  }
})
