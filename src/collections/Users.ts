import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

/** Admin accounts. The only collection allowed into /admin (see `admin.user` in payload.config.ts). */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
