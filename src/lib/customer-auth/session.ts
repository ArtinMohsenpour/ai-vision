import { cookies } from 'next/headers'
import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { CUSTOMER_SESSION_SECONDS } from './policy'
import { hasCustomerSessionGrant, revokeCustomerSession } from './session-grants'
import { authTransaction } from './transaction'

const secure = process.env.NODE_ENV === 'production'
const customerCookie = secure ? '__Host-rheino-customer' : 'rheino-customer'
const options = { httpOnly: true, secure, sameSite: 'lax', path: '/' } as const

export async function setCustomerSession(token: string) {
  ;(await cookies()).set(customerCookie, token, { ...options, maxAge: CUSTOMER_SESSION_SECONDS })
}

async function authenticatedCustomer() {
  const token = (await cookies()).get(customerCookie)?.value
  if (!token) return null
  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `Bearer ${token}`, DisableAutologin: 'true' }),
  })
  if (user?.collection !== 'customers' || user._verified !== true) return null
  return { payload, user }
}

export const getCustomerSession = cache(async () => {
  const session = await authenticatedCustomer()
  if (!session || session.user.suspended) return null
  const sid =
    '_sid' in session.user && typeof session.user._sid === 'string' ? session.user._sid : null
  if (!sid || !(await hasCustomerSessionGrant(session.payload.db.drizzle, session.user.id, sid)))
    return null
  return { ...session, sid }
})

export const getCustomer = cache(async () => (await getCustomerSession())?.user ?? null)

export async function expireCustomerCookie() {
  ;(await cookies()).set(customerCookie, '', { ...options, maxAge: 0 })
}

export async function clearCustomerSession() {
  const session = await authenticatedCustomer()
  if (session && '_sid' in session.user && typeof session.user._sid === 'string') {
    const sid = session.user._sid
    await authTransaction(session.payload, (_, db) =>
      revokeCustomerSession(db, session.user.id, sid),
    )
  }
  await expireCustomerCookie()
}
