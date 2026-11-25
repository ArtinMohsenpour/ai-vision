import { sql } from '@payloadcms/db-postgres'
import { createHmac, randomInt } from 'node:crypto'
import { isIP } from 'node:net'
import type { Payload } from 'payload'

import type { AuthMode } from './policy'

export async function allowAuthRequest(
  payload: Payload,
  mode: AuthMode | 'second-factor' | 'account-security' | 'account-profile' | 'checkout',
  headers: Headers,
  email?: string,
) {
  const ipHeader = process.env.CUSTOMER_AUTH_IP_HEADER
  const suppliedIP = ipHeader ? headers.get(ipHeader)?.trim() : undefined
  const ip = suppliedIP && isIP(suppliedIP) ? suppliedIP : undefined

  async function take(key: string, max: number, seconds: number) {
    const bucket = createHmac('sha256', payload.secret)
      .update(`auth-limit:${mode}:${key}`)
      .digest('hex')
    const result = await payload.db.drizzle.execute(sql`
      INSERT INTO rheino_auth.rate_limits AS limits (bucket, attempts, expires_at)
      VALUES (${bucket}, 1, now() + ${seconds} * interval '1 second')
      ON CONFLICT (bucket) DO UPDATE
      SET attempts = CASE WHEN limits.expires_at <= now() THEN 1 ELSE limits.attempts + 1 END,
        expires_at = CASE WHEN limits.expires_at <= now() THEN excluded.expires_at ELSE limits.expires_at END
      WHERE limits.expires_at <= now() OR limits.attempts < ${max}
      RETURNING bucket
    `)
    return result.rows.length === 1
  }

  if (randomInt(100) === 0)
    await payload.db.drizzle.execute(
      sql`DELETE FROM rheino_auth.rate_limits WHERE expires_at <= now()`,
    )

  // Narrow limits first: a request already blocked for its IP or email must not use up the
  // site-wide limit, or one client could lock every customer out.
  if (ip && !(await take(`ip:${ip}`, mode === 'login' ? 15 : 10, 300))) return false
  const limits = {
    'second-factor': [8, 300],
    'account-security': [10, 900],
    'account-profile': [20, 300],
    checkout: [10, 900],
  } as const
  if (email && mode !== 'login') {
    const [max, seconds] = mode in limits ? limits[mode as keyof typeof limits] : [4, 900]
    if (!(await take(`email:${email}`, max, seconds))) return false
  }
  return take('all', ip ? 150 : 60, 60)
}
