import type { GlobalConfig } from 'payload'
import { ValidationError } from 'payload'

import { isAdmin, publishedOrAdmin } from '@/access'
import { linkFields } from '@/fields/link'
import { rowLabel } from '@/fields/row-label'
import { protectGlobalDrafts } from '@/hooks/protect-drafts'
import { revalidateGlobal } from '@/hooks/revalidate'
import { ADMIN_GROUPS, CMS_VERSION_LIMIT } from '@/lib/cms'

type NavItem = { type?: string; children?: unknown[] | null }

export const Navbar: GlobalConfig = {
  slug: 'navbar',
  label: 'Navigation',
  admin: {
    group: ADMIN_GROUPS.settings,
    description:
      'The menu at the top of every page. Drag items to reorder, translate labels with the locale selector, then publish.',
  },
  access: { read: publishedOrAdmin, update: isAdmin, readVersions: isAdmin },
  hooks: {
    beforeOperation: [protectGlobalDrafts],
    afterChange: [revalidateGlobal],
    beforeValidate: [
      ({ data }) => {
        for (const item of (data?.items ?? []) as NavItem[]) {
          if (item.type === 'dropdown' && !item.children?.length)
            throw new ValidationError({
              global: 'navbar',
              errors: [{ path: 'items', message: 'A dropdown needs at least one link.' }],
            })
        }
        return data
      },
    ],
  },
  versions: { drafts: true, max: CMS_VERSION_LIMIT },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      maxDepth: 1,
      admin: {
        description:
          'Optional. Replaces the text logo. A transparent PNG or WebP works best. The footer reuses it unless it has its own.',
      },
    },
    {
      name: 'items',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Menu item', plural: 'Menu items' },
      admin: { components: { RowLabel: rowLabel(['label'], 'Menu item') } },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, maxLength: 60 },
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'link',
              options: [
                { label: 'Link', value: 'link' },
                { label: 'Dropdown', value: 'dropdown' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'appearance',
              type: 'select',
              defaultValue: 'link',
              options: [
                { label: 'Text link', value: 'link' },
                { label: 'Button (call to action)', value: 'button' },
              ],
              admin: { width: '50%', condition: (_, sibling) => sibling?.type === 'link' },
            },
          ],
        },
        {
          name: 'link',
          type: 'group',
          admin: { condition: (_, sibling) => sibling?.type !== 'dropdown' },
          fields: linkFields(),
        },
        {
          name: 'children',
          label: 'Dropdown links',
          type: 'array',
          maxRows: 12,
          admin: {
            condition: (_, sibling) => sibling?.type === 'dropdown',
            components: { RowLabel: rowLabel(['label'], 'Link') },
          },
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, maxLength: 60 },
            { name: 'description', type: 'text', localized: true, maxLength: 120 },
            { name: 'link', type: 'group', fields: linkFields() },
          ],
        },
      ],
    },
  ],
}
