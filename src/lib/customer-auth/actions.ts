'use server'

import { sql } from '@payloadcms/db-postgres'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { randomBytes } from 'node:crypto'
import {
  APIError,
  AuthenticationError,
  LockedAuth,
  UnverifiedEmail,
  ValidationError,
  createLocalReq,
  getPayload,
  type Payload,
} from 'payload'

import { localizedPath, type Locale } from '@/i18n/routing'
import config from '@/payload.config'
import { customerEmail, customerMailAvailable, verificationToken } from './email'
import { secondFactorError } from './mfa'
import { authModes, type AuthMessage, type AuthMode, type FormState } from './policy'
import { allowAuthRequest } from './rate-limit'
import { safeNextPath } from './next-path'
import { customerRequest } from './request'
import { clearCustomerSession, setCustomerSession } from './session'
import { advanceCredentialEpoch, revokeCustomerSessions } from './session-grants'
import { authTransaction } from './transaction'
import { normalizeEmail, readAuthForm, validateAuthForm } from './validation/fields'

const collection = 'customers' as const
function deliverAfterResponse(payload: Payload, work: () => Promise<unknown>) {
  // SMTP timings should not reveal whether an address belongs to an account.
  after(async () => {
    try {
      await work()
    } catch (error) {
      if (!(error instanceof ValidationError))
        payload.logger.warn('Customer account email request could not be completed')
    }
  })
}

async function resetPassword(payload: Payload, token: string, password: string) {
  return authTransaction(payload, async (req, db) => {
    // Lock the matching row so two submissions cannot consume the same reset link.
    const { rows } = await db.execute<{ id: number }>(sql`
      SELECT id FROM customers
      WHERE reset_password_token = ${token}
        AND reset_password_expiration > clock_timestamp() AND suspended IS NOT TRUE
      FOR UPDATE
    `)
    const account = rows[0]
    if (!account) return false
    req.context.customerRecoveryOnly = true
    await payload.resetPassword({
      collection,
      data: { password, token },
      overrideAccess: false,
      req,
    })
    // Payload invalidates old sessions on reset and creates a fresh one. Sign in explicitly instead.
    await advanceCredentialEpoch(db, account.id)
    await revokeCustomerSessions(db, account.id)
    return true
  })
}

export async function submitCustomerAuth(
  mode: AuthMode,
  locale: Locale,
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  if (
    (locale !== 'de' && locale !== 'en') ||
    !authModes.includes(mode) ||
    !(form instanceof FormData)
  )
    return { message: 'unavailable' }
  const { token, inputs } = readAuthForm(mode, form)
  const errors = validateAuthForm(mode, token, inputs)
  const email =
    inputs.email !== undefined && !errors.email ? normalizeEmail(inputs.email) : undefined
  const values: NonNullable<FormState['values']> = { email }
  for (const field of ['firstName', 'lastName', 'company', 'business'] as const) {
    if (!errors[field] && inputs[field] !== undefined) values[field] = inputs[field].trim()
  }
  if (Object.keys(errors).length) return { errors, values }
  const problem = (message: AuthMessage): FormState => ({ message, values })
  const sent = (message: AuthMessage): FormState => ({ message, sent: true })
  const password = inputs.password ?? ''
  // Where to continue after login or verification, e.g. back to an order page.
  const next = safeNextPath(form.get('next'))
  let destination: string | undefined

  try {
    const origin = await customerRequest()
    if (!origin) return problem('unavailable')
    const payload = await getPayload({ config })
    if (!(await allowAuthRequest(payload, mode, origin.requestHeaders, email)))
      return problem('rateLimited')
    const context = {
      customerLocale: locale,
      customerOrigin: origin.canonical,
      ...(next ? { customerNext: next } : {}),
    }

    switch (mode) {
      case 'login': {
        const factor = form.get('factor')
        if (typeof factor === 'string' && factor.length > 64) return problem('invalidSecondFactor')
        if (
          factor &&
          !(await allowAuthRequest(payload, 'second-factor', origin.requestHeaders, email))
        )
          return problem('rateLimited')
        const { token: session } = await payload.login({
          collection,
          data: { email: email!, password },
          context: { customerFactor: factor, customerWebsiteLogin: true },
          overrideAccess: false,
        })
        if (!session) return problem('invalidCredentials')
        await setCustomerSession(session)
        destination = next ?? '/account'
        break
      }
      case 'signup': {
        if (!customerMailAvailable) return problem('unavailable')
        deliverAfterResponse(payload, () =>
          payload.create({
            collection,
            depth: 0,
            overrideAccess: false,
            context: { ...context, customerRegistration: true },
            data: {
              email: email!,
              password,
              firstName: values.firstName!,
              lastName: values.lastName!,
              company: values.company || undefined,
              businessConfirmedAt: new Date().toISOString(),
            },
          }),
        )
        return sent('signupSent')
      }
      case 'forgot-password':
        if (!customerMailAvailable) return problem('unavailable')
        deliverAfterResponse(payload, () =>
          payload.forgotPassword({ collection, data: { email: email! }, context }),
        )
        return sent('resetSent')
      case 'verify-email': {
        if (token) {
          const raw = verificationToken(payload.secret, token)
          const result = raw
            ? await payload.db.drizzle.execute(sql`
                UPDATE customers SET _verified = true, _verificationtoken = null, updated_at = now()
                WHERE _verificationtoken = ${raw} AND _verified IS NOT TRUE AND suspended IS NOT TRUE
                RETURNING id
              `)
            : null
          destination = result?.rows.length
            ? `/login?status=verified${next ? `&next=${encodeURIComponent(next)}` : ''}`
            : '/verify-email?status=invalid-link'
          break
        }
        if (!customerMailAvailable) return problem('unavailable')
        deliverAfterResponse(payload, async () => {
          const nextToken = randomBytes(20).toString('hex')
          const result = await payload.db.drizzle.execute(sql`
            UPDATE customers SET _verificationtoken = ${nextToken}
            WHERE email = ${email} AND _verified IS NOT TRUE AND suspended IS NOT TRUE
            RETURNING id
          `)
          if (result.rows.length) {
            const req = await createLocalReq({ context }, payload)
            await payload.sendEmail({ ...customerEmail('verify', req, nextToken), to: email })
          }
        })
        return sent('verificationSent')
      }
      case 'reset-password':
        if (!/^[a-f0-9]{40}$/.test(token) || !(await resetPassword(payload, token, password)))
          return problem('invalidLink')
        destination = '/login?status=reset'
        break
      default:
        return problem('unavailable')
    }
  } catch (error) {
    if (mode === 'login') {
      const factorError = secondFactorError(error)
      if (factorError) return problem(factorError)
      if (error instanceof UnverifiedEmail) return problem('unverified')
      if (error instanceof AuthenticationError || error instanceof LockedAuth)
        return problem('invalidCredentials')
    }
    if (mode === 'reset-password' && error instanceof APIError && error.status === 403)
      return problem('invalidLink')
    console.error(`Customer auth ${mode} failed`)
    return problem('unavailable')
  }

  redirect(localizedPath(locale, destination))
}

export async function signOutCustomer(locale: Locale) {
  if (locale !== 'de' && locale !== 'en') return
  if (!(await customerRequest())) return
  await clearCustomerSession()
  redirect(localizedPath(locale, '/login'))
}
