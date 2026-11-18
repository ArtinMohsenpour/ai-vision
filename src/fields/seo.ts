import type { Field } from 'payload'

export const seoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    label: 'Search & sharing',
    fields: [
      {
        name: 'title',
        type: 'text',
        localized: true,
        maxLength: 70,
        admin: { description: 'Optional. Falls back to the page title and the site name.' },
      },
      {
        name: 'description',
        type: 'textarea',
        localized: true,
        maxLength: 320,
        admin: { description: 'Optional search-result text (about 120–160 characters). Falls back to the subtitle.' },
      },
      {
        name: 'image',
        label: 'Sharing image',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'noIndex',
        label: 'Hide from search engines',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },
]
