import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'

/** Public website images only. Stored on the server's disk; never store private files here. */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
  upload: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'card', width: 768 },
      { name: 'wide', width: 1600 },
    ],
  },
}
