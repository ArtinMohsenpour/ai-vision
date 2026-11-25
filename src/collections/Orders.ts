import type { Access, CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'

import { isAdmin, isAdminField } from '@/access'
import { hasGrantedCustomerSession } from '@/access/customer-session'
import { moneyField } from '@/fields/money'
import { ADMIN_GROUPS } from '@/lib/cms'
import { deferAfterCommit } from '@/lib/shop/defer'
import { sendBalanceRequestEmail } from '@/lib/shop/email'
import { paymentState } from '@/lib/shop/payment-state'
import type { PaymentEntry } from '@/lib/shop/types'

const readOrders: Access = async ({ req }) => {
  const { user } = req
  if (user?.collection === 'users') return true
  if (user?.collection !== 'customers' || user._verified !== true || user.suspended) return false
  return (await hasGrantedCustomerSession(req)) ? { customer: { equals: user.id } } : false
}

// Written only by checkout and Stripe webhooks (context.shopSystem), never through the admin.
const SYSTEM_FIELDS = [
  'number',
  'customer',
  'locale',
  'snapshot',
  'payments',
  'billing',
  'termsAcceptedAt',
] as const

const keepSystemFieldsAndDerivePayments: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation === 'update' && originalDoc && !req.context.shopSystem) {
    for (const key of SYSTEM_FIELDS) data[key] = originalDoc[key]
  }
  const pick = <K extends string>(key: K) => (key in data ? data[key] : originalDoc?.[key])
  const payments = ((pick('payments') ?? []) as PaymentEntry[]).map((payment) => ({
    kind: payment.kind,
    status: payment.status,
    amount: payment.amount ?? 0,
    refunded: payment.refunded ?? 0,
  }))
  const manual = ((pick('manualPayments') ?? []) as { amount?: number | null }[]).map(
    (payment) => ({ amount: payment.amount ?? 0 }),
  )
  const total = (pick('snapshot') as { total?: number } | undefined)?.total ?? 0
  const state = paymentState(total, payments, manual)
  Object.assign(data, state)

  if (state.paymentStatus !== 'unpaid' && pick('status') === 'awaiting_payment') data.status = 'new'
  if (
    pick('balanceRequested') === true &&
    originalDoc?.balanceRequested !== true &&
    state.paymentStatus === 'deposit_paid' &&
    !pick('balanceRequestedAt')
  ) {
    data.balanceRequestedAt = new Date().toISOString()
    req.context.sendBalanceRequest = true
  }
  return data
}

const readOnly = { readOnly: true } as const
const cents = (name: string, label: string): Field => {
  const field = moneyField(name, { label, required: false, allowZero: true })
  return { ...field, defaultValue: 0, admin: { ...field.admin, readOnly: true } }
}

/** Orders with a price snapshot. Created by checkout; payments are confirmed by Stripe webhooks. */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    group: ADMIN_GROUPS.shop,
    useAsTitle: 'number',
    defaultColumns: ['number', 'customer', 'paymentStatus', 'status', 'balanceDue', 'createdAt'],
    description:
      'Created when a customer starts checkout. Payments are confirmed by Stripe. Edit the work status, request the remaining balance, record bank transfers and keep notes.',
  },
  access: {
    read: readOrders,
    // Versions hold every order's billing details; without this Payload lets any logged-in user read them.
    readVersions: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: { maxPerDoc: 25 },
  hooks: {
    beforeChange: [keepSystemFieldsAndDerivePayments],
    afterChange: [
      async ({ doc, req }) => {
        if (req.context.sendBalanceRequest !== true) return doc
        req.context.sendBalanceRequest = false
        await deferAfterCommit(() => sendBalanceRequestEmail(req.payload, doc), req.payload.logger)
        return doc
      },
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || doc.number) return doc
        const number = `R-${new Date(doc.createdAt).getFullYear()}-${String(doc.id).padStart(4, '0')}`
        await req.payload.update({
          collection: 'orders',
          id: doc.id,
          data: { number },
          overrideAccess: true,
          context: { shopSystem: true },
          req,
        })
        return { ...doc, number }
      },
    ],
  },
  fields: [
    { name: 'number', type: 'text', unique: true, index: true, admin: readOnly },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Work status',
          type: 'select',
          required: true,
          defaultValue: 'awaiting_payment',
          options: [
            { label: 'Awaiting payment', value: 'awaiting_payment' },
            { label: 'New', value: 'new' },
            { label: 'In progress', value: 'in_progress' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        {
          name: 'paymentStatus',
          type: 'select',
          defaultValue: 'unpaid',
          options: [
            { label: 'Unpaid', value: 'unpaid' },
            { label: 'Deposit paid', value: 'deposit_paid' },
            { label: 'Paid', value: 'paid' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Partially refunded', value: 'partially_refunded' },
          ],
          admin: { ...readOnly, description: 'Set by Stripe payments and manual payments.' },
        },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      admin: readOnly,
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'de',
      options: ['de', 'en'],
      admin: { ...readOnly, position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        cents('amountPaid', 'Paid'),
        cents('balanceDue', 'Balance due'),
        cents('amountRefunded', 'Refunded'),
      ],
    },
    {
      name: 'balanceRequested',
      label: 'Request remaining balance',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Turn on when the rest is due. The customer gets an email once and can pay from their account.',
      },
    },
    { name: 'balanceRequestedAt', type: 'date', admin: readOnly },
    {
      name: 'manualPayments',
      label: 'Payments outside Stripe',
      type: 'array',
      admin: { description: 'For example a bank transfer. Updates the balance when saved.' },
      fields: [
        {
          type: 'row',
          fields: [
            moneyField('amount', { label: 'Amount (gross)' }),
            {
              name: 'method',
              type: 'select',
              required: true,
              defaultValue: 'bank_transfer',
              options: [
                { label: 'Bank transfer', value: 'bank_transfer' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'date',
              type: 'date',
              required: true,
              defaultValue: () => new Date().toISOString(),
            },
          ],
        },
        { name: 'note', type: 'text', access: { read: isAdminField, update: isAdminField } },
      ],
    },
    {
      name: 'snapshot',
      type: 'group',
      admin: {
        ...readOnly,
        description: 'Prices at order time. Later price changes never alter it.',
      },
      fields: [
        { name: 'serviceId', type: 'number' },
        { name: 'serviceSlug', type: 'text' },
        { name: 'serviceTitle', type: 'text' },
        { name: 'baseName', type: 'text' },
        { name: 'basePrice', type: 'number' },
        { name: 'baseDays', type: 'number' },
        {
          name: 'extras',
          type: 'array',
          fields: [
            { name: 'extraId', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'price', type: 'number' },
            { name: 'days', type: 'number' },
          ],
        },
        { name: 'subtotal', type: 'number' },
        { name: 'vatRate', type: 'number' },
        { name: 'vat', type: 'number' },
        { name: 'total', type: 'number', required: true },
        { name: 'depositPercent', type: 'number' },
        { name: 'depositNet', type: 'number' },
        { name: 'deliveryDays', type: 'number' },
      ],
    },
    {
      name: 'payments',
      type: 'array',
      admin: readOnly,
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: ['full', 'deposit', 'balance'],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: ['open', 'pending', 'paid', 'failed', 'expired'],
        },
        { name: 'amount', type: 'number', required: true },
        { name: 'refunded', type: 'number', defaultValue: 0 },
        { name: 'checkoutSessionId', type: 'text', index: true },
        { name: 'checkoutUrl', type: 'text' },
        { name: 'expiresAt', type: 'date' },
        { name: 'paymentIntentId', type: 'text', index: true },
        { name: 'paidAt', type: 'date' },
      ],
    },
    {
      name: 'billing',
      type: 'group',
      admin: { ...readOnly, description: 'From the Stripe payment page.' },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'vatId', type: 'text' },
      ],
    },
    { name: 'termsAcceptedAt', type: 'date', admin: { ...readOnly, position: 'sidebar' } },
    {
      name: 'stripeLinks',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '/components/admin/stripe-link' } },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      access: { read: isAdminField, update: isAdminField },
      admin: { position: 'sidebar' },
    },
  ],
}
