import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'
import { ADMIN_GROUPS } from '@/lib/cms'

/** Admin accounts. The only collection allowed into /admin (see `admin.user` in payload.config.ts). */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: ADMIN_GROUPS.admin,
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
