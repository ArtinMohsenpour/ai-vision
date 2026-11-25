import { sql } from '@payloadcms/db-postgres'
import { APIError, AuthenticationError, type CollectionConfig, type PayloadRequest } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf } from '@/access'
import { hasGrantedCustomerSession } from '@/access/customer-session'
import { ADMIN_GROUPS } from '@/lib/cms'
import { customerEmail } from '@/lib/customer-auth/email'
import { verifyCustomerLogin } from '@/lib/customer-auth/mfa'
import { CUSTOMER_SESSION_SECONDS } from '@/lib/customer-auth/policy'
import {
  advanceCredentialEpoch,
  captureCredentialEpoch,
  grantCustomerSession,
  revokeCustomerSessions,
} from '@/lib/customer-auth/session-grants'
import { authDatabase } from '@/lib/customer-auth/transaction'
import { profileFieldRules } from '@/lib/customer-auth/validation/fields'

const customerRecordAccess: typeof isAdminOrSelf = async (args) =>
  (await hasGrantedCustomerSession(args.req)) ? isAdminOrSelf(args) : false

/**
 * Website customer accounts. Customers log in on the website's own pages, never in /admin:
 * payload.config.ts sets `admin.user` to `users`, so a customer session cannot open the admin.
 * Business customers only (§14 BGB): registration requires business confirmation.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'company', 'firstName', 'lastName', 'createdAt', 'suspended'],
    group: ADMIN_GROUPS.shop,
  },
  auth: {
    verify: {
      generateEmailHTML: ({ req, token }) => customerEmail('verify', req, token).html,
      generateEmailSubject: ({ req }) => customerEmail('verify', req).subject,
    },
    forgotPassword: {
      expiration: 30 * 60 * 1000,
      minRequestInterval: 60_000,
      generateEmailHTML: (input) => customerEmail('reset', input?.req, input?.token).html,
      generateEmailSubject: (input) => customerEmail('reset', input?.req).subject,
    },
    useSessions: true,
    tokenExpiration: CUSTOMER_SESSION_SECONDS,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    create: ({ req }) =>
      isAdmin({ req }) ||
      (req.payloadAPI === 'local' && req.context?.customerRegistration === true),
    read: customerRecordAccess,
    update: customerRecordAccess,
    delete: isAdmin,
  },
  // The website actions own customer credentials and their rate limits. Keep CMS CRUD available.
  endpoints: [
    '/login',
    '/logout',
    '/first-register',
    '/refresh-token',
    '/forgot-password',
    '/reset-password',
    '/verify/:id',
  ].map((path) => ({
    path,
    method: 'post' as const,
    handler: () => new Response(null, { status: 404 }),
  })),
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // Orders (and the invoices behind them) must be kept for 8 years.
        const { totalDocs } = await req.payload.count({
          collection: 'orders',
          where: { customer: { equals: id } },
          overrideAccess: true,
          req,
        })
        if (totalDocs)
          throw new APIError(
            'Customers with orders cannot be deleted. Orders must be kept for 8 years.',
            400,
          )
      },
    ],
    afterChange: [
      async ({ context, doc, previousDoc, req, operation }) => {
        const passwordChanged = context.customerPasswordChanged === true
        const suspended = doc.suspended && !previousDoc?.suspended
        if (operation === 'update' && (passwordChanged || suspended)) {
          const db = authDatabase(req)
          if (passwordChanged) {
            await db.execute(sql`
              UPDATE customers SET reset_password_token = NULL, reset_password_expiration = NULL
              WHERE id = ${doc.id}
            `)
          }
          await advanceCredentialEpoch(db, doc.id)
          await revokeCustomerSessions(db, doc.id)
        }
        return doc
      },
    ],
    beforeLogin: [
      async ({ user, req }) => {
        if (user.suspended) throw new AuthenticationError(req.t)
        // The email reset uses Payload's reset operation but discards its session before commit.
        if (req.payloadAPI === 'local' && req.context.customerRecoveryOnly === true) return user
        await verifyCustomerLogin(req, user.id)
        return user
      },
    ],
    afterLogin: [
      async ({ user, req, token }) => {
        if (req.context.customerRecoveryOnly === true) return user
        if (req.context.customerWebsiteLogin === true)
          await grantCustomerSession(req, user.id, token)
        const afterReauthentication = req.context.customerAfterReauthentication
        if (req.payloadAPI === 'local' && typeof afterReauthentication === 'function') {
          await (afterReauthentication as (req: PayloadRequest, token: string) => Promise<void>)(
            req,
            token,
          )
        }
        return user
      },
    ],
    beforeOperation: [
      async ({ args, req, operation, overrideAccess }) => {
        if (operation === 'login' && typeof args.data.email === 'string')
          await captureCredentialEpoch(req, args.data.email)
        if (operation !== 'update' && operation !== 'updateByID') return args
        // Filter before Payload reads the password, email or internal auth fields for an update.
        if (!overrideAccess && req.user?.collection === 'customers') {
          const profile = ['firstName', 'lastName', 'company', 'address', 'vatId', 'phone']
          if (req.payloadAPI === 'local' && req.context.customerPasswordChange === true)
            profile.push('password')
          args.data = Object.fromEntries(
            Object.entries(args.data).filter(([key]) => profile.includes(key)),
          )
        }
        // Payload removes the plaintext password before calling afterChange.
        req.context.customerPasswordChanged =
          typeof args.data.password === 'string' && args.data.password.length > 0
        return args
      },
    ],
  },
  fields: [
    { name: 'firstName', type: 'text', ...profileFieldRules.firstName },
    { name: 'lastName', type: 'text', ...profileFieldRules.lastName },
    {
      name: 'company',
      type: 'text',
      ...profileFieldRules.company,
      label: 'Company or trade name',
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim() || null : value)],
      },
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
