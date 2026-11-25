import type { Field, NumberField, Tab, TextFieldSingleValidation } from 'payload'

import { moneyField } from './money'
import { rowLabel } from './row-label'

export const EXTRA_ICONS = [
  'cms',
  'portal',
  'chatbot',
  'payment',
  'seo',
  'language',
  'design',
  'analytics',
  'automation',
  'generic',
] as const
export type ExtraIcon = (typeof EXTRA_ICONS)[number]

const ordersOnline = (data: Record<string, unknown> | undefined) => data?.mode === 'order'
const showWhenOrdering = {
  condition: (_: unknown, sibling: Record<string, unknown>) => ordersOnline(sibling),
}

// Base texts are required in German only; English falls back to German.
const requiredForOrdering =
  (maxLength: number): TextFieldSingleValidation =>
  (value, { siblingData, req }) => {
    if (typeof value === 'string' && value.length > maxLength)
      return `Use ${maxLength} characters or fewer.`
    if (!ordersOnline(siblingData as Record<string, unknown>)) return true
    if (req?.locale && req.locale !== 'de') return true
    return typeof value === 'string' && value.trim()
      ? true
      : 'Required when the service can be ordered online.'
  }

function daysField(
  name: string,
  label: string,
  required: (sibling: Record<string, unknown>) => boolean,
  description: string,
): NumberField {
  return {
    name,
    type: 'number',
    label,
    min: 0,
    max: 365,
    defaultValue: name === 'days' ? 0 : undefined,
    validate: (value: number | number[] | null | undefined, { siblingData }) => {
      if (value === null || value === undefined)
        return required((siblingData ?? {}) as Record<string, unknown>)
          ? 'Enter the working days.'
          : true
      return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 365
        ? true
        : 'Enter whole working days between 0 and 365.'
    },
    admin: { description },
  }
}

const includesField = (
  name: string,
  label: string,
  description: string,
  admin: { condition?: (typeof showWhenOrdering)['condition'] } = {},
): Field => ({
  name,
  label,
  type: 'array',
  localized: true,
  maxRows: 8,
  admin: { ...admin, description, components: { RowLabel: rowLabel(['text'], 'Item') } },
  fields: [{ name: 'text', type: 'text', required: true, maxLength: 100 }],
})

/** Ordering settings of a service: base package, deposit and extras (spec §1). */
export const orderingTab: Tab = {
  label: 'Ordering',
  description:
    'Prices and extras for online ordering. Prices are net, in euros. Changes apply to new orders once the service is published; existing orders keep their prices.',
  fields: [
    {
      name: 'ordering',
      type: 'group',
      label: false,
      fields: [
        {
          name: 'mode',
          type: 'select',
          defaultValue: 'off',
          options: [
            { label: 'Not shown on the pricing page', value: 'off' },
            { label: 'Order online', value: 'order' },
            { label: 'Request a quote (link to the contact page)', value: 'quote' },
          ],
        },
        {
          name: 'baseName',
          label: 'Base package name',
          type: 'text',
          localized: true,
          validate: requiredForOrdering(80),
          admin: { ...showWhenOrdering, description: 'For example "Simple website".' },
        },
        {
          name: 'baseDescription',
          label: 'Base package description',
          type: 'textarea',
          localized: true,
          maxLength: 300,
          admin: showWhenOrdering,
        },
        includesField(
          'baseIncludes',
          'Included in every order',
          'Short points, for example "Up to 5 pages".',
          showWhenOrdering,
        ),
        {
          type: 'row',
          admin: showWhenOrdering,
          fields: [
            moneyField('basePrice', {
              label: 'Base price (net)',
              required: ordersOnline,
            }),
            daysField(
              'baseDays',
              'Delivery (working days)',
              ordersOnline,
              'For the base package alone.',
            ),
            {
              name: 'depositPercent',
              label: 'Deposit (%)',
              type: 'number',
              min: 0,
              max: 100,
              admin: {
                description:
                  'Optional. Empty, 0 or 100 means the customer pays everything at checkout.',
              },
            },
          ],
        },
        {
          name: 'extras',
          type: 'array',
          maxRows: 30,
          admin: {
            ...showWhenOrdering,
            description:
              'Options the customer can add. Drag to reorder. Switch off "Active" to hide one without deleting it.',
            components: { RowLabel: rowLabel(['title'], 'Extra') },
          },
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, maxLength: 60 },
            {
              name: 'summary',
              type: 'text',
              localized: true,
              maxLength: 120,
              admin: { description: 'One line under the title in the list.' },
            },
            {
              type: 'row',
              fields: [
                moneyField('price', { label: 'Price (net)' }),
                daysField('days', 'Extra working days', () => true, 'Added to the delivery time.'),
                { name: 'active', type: 'checkbox', defaultValue: true },
              ],
            },
            {
              type: 'collapsible',
              label: 'Preview',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                  maxLength: 500,
                  admin: {
                    description:
                      'Shown in the preview panel when the customer looks at this extra.',
                  },
                },
                includesField('includes', 'What you get', 'Short points shown with check marks.'),
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Optional image or screenshot. Without one, the icon is shown.',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'generic',
                  options: EXTRA_ICONS.map((value) => ({ label: value, value })),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
