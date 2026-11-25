import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

/** Stripe webhook events already processed. The unique event ID makes processing happen once. */
export const StripeEvents: CollectionConfig = {
  slug: 'stripe-events',
  admin: { hidden: true, useAsTitle: 'eventId' },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'eventId', type: 'text', required: true, unique: true, index: true },
    { name: 'type', type: 'text', required: true },
    { name: 'processedAt', type: 'date', required: true },
  ],
}
