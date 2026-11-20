'use server'

import { sql } from '@payloadcms/db-postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AuthenticationError, LockedAuth, UnverifiedEmail, type PayloadRequest } from 'payload'

import { localizedPath, type Locale } from '@/i18n/routing'
import { activateAuthenticator, prepareAuthenticator, secondFactorError } from './mfa'
import {
  portalValue,
  readPortalProfile,
  validatePortalProfile,
  type ProfileState,
} from './portal-fields'
import { allowAuthRequest } from './rate-limit'
import { customerRequest } from './request'
import { expireCustomerCookie, getCustomerSession } from './session'
import {
  advanceCredentialEpoch,
  issuedSessionId,
  revokeCustomerSession,
  revokeCustomerSessions,
} from './session-grants'
import { authTransaction, authDatabase } from './transaction'
import { validateAuthField } from './validation/fields'

export type SecurityOperation = 'password' | 'start' | 'activate' | 'disable'
export type SecurityState = {
  message?:
    | 'unavailable'
    | 'rateLimited'
    | 'invalidCredentials'
    | 'secondFactorRequired'
    | 'invalidSecondFactor'
    | 'setupExpired'
    | 'mfaDisabled'
  errors?: Partial<
    Record<
      'currentPassword' | 'password' | 'confirmation' | 'factor',
      NonNullable<ReturnType<typeof validateAuthField>>
    >
  >
  setup?: { key: string; qr: string }
  recoveryCodes?: string[]
}

type Session = NonNullable<Awaited<ReturnType<typeof getCustomerSession>>>
type AuthDb = ReturnType<typeof authDatabase>

async function lockSession(db: AuthDb, { user, sid }: Session) {
  const { rows } = await db.execute(sql`
    SELECT id FROM customers WHERE id = ${user.id}
      AND _verified IS TRUE AND suspended IS NOT TRUE
    FOR UPDATE
  `)
  if (!rows.length) return false
  const session = await db.execute(sql`
    SELECT sessions.id FROM customers_sessions sessions
    JOIN rheino_auth.customer_session_grants grants
      ON grants.id = sessions.id AND grants.customer_id = sessions._parent_id
    WHERE sessions.id = ${sid} AND sessions._parent_id = ${user.id}
      AND sessions.expires_at > clock_timestamp() AND grants.expires_at > clock_timestamp()
  `)
  return session.rows.length === 1
}

export async function saveCustomerProfile(
  locale: Locale,
  _state: ProfileState,
  form: FormData,
): Promise<ProfileState> {
  if ((locale !== 'de' && locale !== 'en') || !(form instanceof FormData))
    return { message: 'unavailable' }
  const values = readPortalProfile(form)
  const errors = validatePortalProfile(values)
  if (Object.keys(errors).length) return { errors }

  try {
    const [origin, session] = await Promise.all([customerRequest(), getCustomerSession()])
    if (!origin || !session) return { message: 'unavailable' }
    const { user, payload } = session
    if (!(await allowAuthRequest(payload, 'account-profile', origin.requestHeaders, user.email)))
      return { message: 'rateLimited' }

    const saved = await authTransaction(payload, async (req, db) => {
      if (!(await lockSession(db, session))) return false
      await payload.update({
        collection: 'customers',
        id: user.id,
        user,
        req,
        overrideAccess: false,
        depth: 0,
        data: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          company: values.company.trim() || null,
          phone: values.phone.trim() || null,
          vatId: values.vatId.trim() || null,
          address: {
            street: values.street.trim() || null,
            postalCode: values.postalCode.trim() || null,
            city: values.city.trim() || null,
            country: values.country.trim().toUpperCase() || null,
          },
        },
      })
      return true
    })
    if (!saved) return { message: 'unavailable' }
    revalidatePath(localizedPath(locale, '/account'))
    return { message: 'profileSaved' }
  } catch {
    console.error('Customer profile update failed')
    return { message: 'unavailable' }
  }
}

export async function updateCustomerSecurity(
  operation: SecurityOperation,
  locale: Locale,
  _state: SecurityState,
  form: FormData,
): Promise<SecurityState> {
  if (
    (locale !== 'de' && locale !== 'en') ||
    !['password', 'start', 'activate', 'disable'].includes(operation) ||
    !(form instanceof FormData)
  )
    return { message: 'unavailable' }

  const currentPassword = portalValue(form, 'currentPassword')
  const password = portalValue(form, 'password')
  const factor = portalValue(form, 'factor').trim()
  const errors: NonNullable<SecurityState['errors']> = {}
  if (operation !== 'activate') {
    const error = validateAuthField('login', 'password', currentPassword, '')
    if (error) errors.currentPassword = error
  }
  if (operation === 'password') {
    const newError = validateAuthField('reset-password', 'password', password, '')
    const matchError = validateAuthField(
      'reset-password',
      'confirmation',
      portalValue(form, 'confirmation'),
      password,
    )
    if (newError) errors.password = newError
    if (matchError) errors.confirmation = matchError
  }
  if ((operation === 'activate' || operation === 'disable') && !factor) errors.factor = 'required'
  if (factor.length > 64) errors.factor = 'invalidSecondFactor'
  if (Object.keys(errors).length) return { errors }

  let result: SecurityState | 'passwordChanged'
  try {
    const [origin, session] = await Promise.all([customerRequest(), getCustomerSession()])
    if (!origin || !session) return { message: 'unavailable' }
    const { user, payload, sid } = session
    if (!(await allowAuthRequest(payload, 'account-security', origin.requestHeaders, user.email)))
      return { message: 'rateLimited' }
    if (
      factor &&
      !(await allowAuthRequest(payload, 'second-factor', origin.requestHeaders, user.email))
    )
      return { message: 'rateLimited' }

    if (operation === 'activate') {
      result = await authTransaction<SecurityState>(payload, async (_, db) => {
        if (!(await lockSession(db, session))) return { message: 'unavailable' }
        const activation = await activateAuthenticator(db, payload, user.id, sid, factor)
        if (activation.recoveryCodes) {
          await advanceCredentialEpoch(db, user.id)
          await revokeCustomerSessions(db, user.id, sid)
        }
        return activation
      })
    } else {
      // Payload opens the transaction only after verifying the current password.
      const outcome: { result?: SecurityState | 'passwordChanged' } = {}
      const customerAfterReauthentication = async (req: PayloadRequest, token: string) => {
        const db = authDatabase(req)
        if (!(await lockSession(db, session))) throw new AuthenticationError(req.t)
        if (operation === 'start') {
          const setup = await prepareAuthenticator(db, payload, {
            id: user.id,
            email: user.email,
            sid,
          })
          await revokeCustomerSession(db, user.id, issuedSessionId(token))
          outcome.result = setup ? { setup } : { message: 'unavailable' }
          return
        }
        if (operation === 'disable') {
          await db.execute(sql`
            UPDATE rheino_auth.customer_mfa
            SET secret = NULL, last_step = NULL, recovery_hashes = '{}',
              pending_secret = NULL, pending_session_id = NULL, pending_expires_at = NULL
            WHERE customer_id = ${user.id}
          `)
          await advanceCredentialEpoch(db, user.id)
          await revokeCustomerSessions(db, user.id, sid)
          outcome.result = { message: 'mfaDisabled' }
          return
        }
        await payload.update({
          collection: 'customers',
          id: user.id,
          data: { password },
          user,
          req,
          overrideAccess: false,
          context: { customerPasswordChange: true },
        })
        outcome.result = 'passwordChanged'
      }

      await payload.login({
        collection: 'customers',
        data: { email: user.email, password: currentPassword },
        context: { customerFactor: factor, customerAfterReauthentication },
        overrideAccess: false,
      })
      result = outcome.result ?? { message: 'unavailable' }
    }
  } catch (error) {
    const factorError = secondFactorError(error)
    if (factorError) return { message: factorError }
    if (
      error instanceof AuthenticationError ||
      error instanceof LockedAuth ||
      error instanceof UnverifiedEmail
    )
      return { message: 'invalidCredentials' }
    console.error('Customer security update failed')
    return { message: 'unavailable' }
  }

  if (result === 'passwordChanged') {
    await expireCustomerCookie()
    redirect(localizedPath(locale, '/login?status=reset'))
  }
  if (result.recoveryCodes || result.message === 'mfaDisabled')
    revalidatePath(localizedPath(locale, '/account/security'))
  return result
}
