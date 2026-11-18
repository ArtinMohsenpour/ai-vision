import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '@/access'
import { sectionsField } from '@/blocks/layouts'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { protectCollectionDrafts } from '@/hooks/protect-drafts'
import { ADMIN_GROUPS, CMS_VERSION_LIMIT } from '@/lib/cms'

/** One page per service at /de/services/<slug> and /en/services/<slug>. */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service page', plural: 'Service pages' },
  defaultSort: 'sortOrder',
  // Links only need the slug; service cards load their own fields.
  defaultPopulate: { slug: true },
  admin: {
    group: ADMIN_GROUPS.services,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'sortOrder'],
    description:
      'Each service has its own page at /services/<slug> and appears in service cards. Translate with the locale selector, save drafts and publish after review.',
  },
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isAdmin,
  },
  hooks: { beforeOperation: [protectCollectionDrafts] },
  versions: { drafts: true, maxPerDoc: CMS_VERSION_LIMIT },
  fields: [
    slugField(
      'Shared by both languages: /de/services/<slug> and /en/services/<slug>. Avoid changing it after publishing.',
    ),
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 100,
      index: true,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              label: 'Page title (H1)',
              type: 'text',
              required: true,
              localized: true,
              maxLength: 120,
            },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              localized: true,
              maxLength: 240,
              admin: { description: 'Lead paragraph and card text.' },
            },
            {
              name: 'keyPoints',
              label: 'Key points',
              type: 'array',
              localized: true,
              maxRows: 5,
              fields: [{ name: 'text', type: 'text', required: true, maxLength: 100 }],
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Optional image for the service card.' },
            },
            sectionsField(),
          ],
        },
        { label: 'SEO', fields: seoFields },
      ],
    },
  ],
}
