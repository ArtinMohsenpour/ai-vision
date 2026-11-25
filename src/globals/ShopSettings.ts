import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isAdminField } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { ADMIN_GROUPS } from '@/lib/cms'

/** Shop-wide settings: VAT, the price note, owner notifications and the ordering switch. */
export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Shop settings',
  admin: {
    group: ADMIN_GROUPS.shop,
    description: 'Applies to every service. Prices on the website are always net.',
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'orderingEnabled',
      label: 'Online ordering is open',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Off hides every order button and blocks checkout. Quote links stay visible.',
      },
    },
    {
      name: 'vatRate',
      label: 'VAT',
      type: 'select',
      required: true,
      defaultValue: '0',
      options: [
        { label: '0 % (small business, §19 UStG)', value: '0' },
        { label: '19 %', value: '19' },
      ],
      admin: {
        description: 'Added on top of net prices at checkout. Every customer pays the same.',
      },
    },
    {
      name: 'priceNote',
      type: 'text',
      localized: true,
      maxLength: 200,
      admin: {
        description: 'Shown under totals, e.g. "All prices net plus 19% VAT" or the §19 UStG note.',
      },
    },
    {
      name: 'orderNotificationEmail',
      label: 'Order notification email',
      type: 'email',
      access: { read: isAdminField, update: isAdminField },
      admin: { description: 'Where new paid orders are announced.' },
    },
  ],
}
