import type { Field } from 'payload'

import { rowLabel } from './row-label'
import { labelledLink } from './link'

/** Page header: optional eyebrow, H1, subtitle and up to two buttons. */
export const pageHeadingFields: Field[] = [
  {
    name: 'eyebrow',
    label: 'Eyebrow (small text above the title)',
    type: 'text',
    localized: true,
    maxLength: 100,
  },
  { name: 'title', label: 'Page title (H1)', type: 'text', localized: true, maxLength: 140 },
  { name: 'subtitle', type: 'textarea', localized: true, maxLength: 600 },
  {
    name: 'actions',
    label: 'Buttons',
    type: 'array',
    maxRows: 2,
    labels: { singular: 'Button', plural: 'Buttons' },
    admin: { components: { RowLabel: rowLabel(['label'], 'Button') } },
    fields: labelledLink({
      maxLength: 40,
      extra: [
        {
          name: 'appearance',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
          ],
        },
      ],
    }),
  },
]
