import type { Field, GlobalConfig, TextFieldSingleValidation } from 'payload'

import { isAdmin, publishedOrAdmin } from '@/access'
import { labelledLink, validateExternalURL } from '@/fields/link'
import { rowLabel } from '@/fields/row-label'
import { protectGlobalDrafts } from '@/hooks/protect-drafts'
import { revalidateGlobal } from '@/hooks/revalidate'
import { ADMIN_GROUPS, CMS_VERSION_LIMIT } from '@/lib/cms'
import { socialPlatforms } from '@/lib/social'

export const PHONE_PATTERN = /^\+?[\d\s()/.-]{5,40}$/

const validatePhone: TextFieldSingleValidation = (value) =>
  !value?.trim() ||
  PHONE_PATTERN.test(value.trim()) ||
  'Use digits, spaces and + ( ) / - . only, e.g. +49 221 1234567.'

const linkList = (name: string, label: string, maxRows: number, description: string): Field => ({
  name,
  label,
  type: 'array',
  maxRows,
  labels: { singular: 'Link', plural: 'Links' },
  admin: { description, initCollapsed: true, components: { RowLabel: rowLabel(['label'], 'Link') } },
  fields: labelledLink({ maxLength: 80 }),
})

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: ADMIN_GROUPS.settings,
    description:
      'Shown at the bottom of every page. Empty fields and sections are hidden. Translate text with the locale selector, then publish.',
  },
  access: { read: publishedOrAdmin, update: isAdmin, readVersions: isAdmin },
  hooks: { beforeOperation: [protectGlobalDrafts], afterChange: [revalidateGlobal] },
  versions: { drafts: true, max: CMS_VERSION_LIMIT },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand & contact',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              maxDepth: 1,
              admin: { description: 'Leave empty to reuse the navigation logo.' },
            },
            {
              name: 'tagline',
              type: 'textarea',
              localized: true,
              maxLength: 240,
              admin: { description: 'A short sentence under the logo.', rows: 2 },
            },
            {
              name: 'contact',
              label: 'Contact details',
              type: 'group',
              admin: { description: 'Optional. Empty fields are not shown.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'email', type: 'email', admin: { width: '50%' } },
                    {
                      name: 'phone',
                      type: 'text',
                      maxLength: 40,
                      validate: validatePhone,
                      admin: { width: '50%', placeholder: '+49 221 1234567' },
                    },
                  ],
                },
                {
                  name: 'address',
                  type: 'textarea',
                  localized: true,
                  maxLength: 300,
                  admin: { description: 'Line breaks are kept.', rows: 3 },
                },
              ],
            },
          ],
        },
        {
          label: 'Link columns',
          fields: [
            {
              name: 'columns',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Column', plural: 'Columns' },
              admin: {
                description: 'Up to four columns, e.g. Services, Company and Customers.',
                components: { RowLabel: rowLabel(['title'], 'Column') },
              },
              fields: [
                { name: 'title', type: 'text', required: true, localized: true, maxLength: 60 },
                linkList('links', 'Links', 12, 'The /de or /en prefix is added automatically.'),
              ],
            },
          ],
        },
        {
          label: 'Social media',
          fields: [
            {
              name: 'social',
              label: 'Profiles',
              type: 'array',
              maxRows: 8,
              labels: { singular: 'Profile', plural: 'Profiles' },
              admin: {
                description: 'Shown as icons. Profiles open in a new tab.',
                components: { RowLabel: rowLabel(['platform'], 'Profile') },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: socialPlatforms.map(({ value, label }) => ({ value, label })),
                      admin: { width: '35%' },
                    },
                    {
                      name: 'url',
                      label: 'Profile URL',
                      type: 'text',
                      required: true,
                      validate: validateExternalURL(true),
                      admin: { width: '65%', placeholder: 'https://' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Bottom bar',
          fields: [
            {
              name: 'copyright',
              type: 'text',
              localized: true,
              maxLength: 120,
              admin: { description: 'Use {year} for the current year, e.g. © {year} AI Vision.' },
            },
            linkList(
              'legalLinks',
              'Legal links',
              6,
              'Impressum, privacy policy and terms. Keep the Impressum reachable from every page.',
            ),
          ],
        },
      ],
    },
  ],
}
