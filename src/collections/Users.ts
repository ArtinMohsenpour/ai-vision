import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'
import { ADMIN_GROUPS } from '@/lib/cms'

/** Admin accounts. The only collection allowed into /admin (see `admin.user` in payload.config.ts). */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin', plural: 'Admins' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email'],
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
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true, maxLength: 75, admin: { width: '50%' } },
        { name: 'lastName', type: 'text', required: true, maxLength: 75, admin: { width: '50%' } },
      ],
    },
  ],
}
