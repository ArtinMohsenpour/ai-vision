import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { revalidateDeletedDocument, revalidateDocument } from '@/hooks/revalidate'
import { ADMIN_GROUPS } from '@/lib/cms'
import { IMAGE_SIZES, MAX_IMAGE_SIDE, MEDIA_MIME_TYPES, mediaResponseHeaders, webp } from '@/lib/media'

/** Public website images only. Stored on the server's disk; never store private files here. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Media library' },
  admin: {
    group: ADMIN_GROUPS.content,
    description:
      'Public website images: PNG, JPEG, WebP or SVG. Photos are converted to WebP and resized automatically. Never upload private documents here.',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateDocument],
    afterDelete: [revalidateDeletedDocument],
  },
  fields: [
    {
      name: 'alt',
      label: 'Image description (alt text)',
      type: 'text',
      required: true,
      localized: true,
      maxLength: 300,
      admin: { description: 'Describe what the image shows, for screen readers and search engines.' },
    },
  ],
  upload: {
    mimeTypes: MEDIA_MIME_TYPES,
    // Applied to raster images only; SVG is stored unchanged.
    formatOptions: webp,
    resizeOptions: { width: MAX_IMAGE_SIDE, height: MAX_IMAGE_SIDE, fit: 'inside', withoutEnlargement: true },
    imageSizes: IMAGE_SIZES.map(({ name, width }) => ({ name, width, formatOptions: webp })),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    modifyResponseHeaders: mediaResponseHeaders,
  },
}
