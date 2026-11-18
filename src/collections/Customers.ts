import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminField, isAdminOrSelf } from '@/access'

/**
 * Website customer accounts. Customers log in on the website's own pages, never in /admin:
 * payload.config.ts sets `admin.user` to `users`, so a customer session cannot open the admin.
 * Business customers only (§14 BGB): registration requires a company name and confirmation.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'company', 'firstName', 'lastName', 'createdAt', 'suspended'],
    group: 'Shop',
  },
  auth: {
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    // Registration from the website; field rules below keep admin-only fields out of reach.
    create: anyone,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: 'firstName', type: 'text', required: true, maxLength: 75 },
    { name: 'lastName', type: 'text', required: true, maxLength: 75 },
    {
      name: 'company',
      type: 'text',
      required: true,
      maxLength: 150,
      label: 'Company or trade name',
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'country', type: 'text', defaultValue: 'DE' },
      ],
    },
    { name: 'vatId', type: 'text', label: 'VAT ID (optional)' },
    { name: 'phone', type: 'text' },
    {
      name: 'businessConfirmedAt',
      type: 'date',
      required: true,
      admin: {
        description:
          'When the customer confirmed ordering as a business (set by the registration form).',
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      access: { read: isAdminField, create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'suspended',
      type: 'checkbox',
      defaultValue: false,
      access: { read: isAdminField, create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      access: { read: isAdminField, create: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
  ],
}
