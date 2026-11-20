import { sql } from '@payloadcms/db-postgres'
import { randomUUID } from 'node:crypto'
import { type PayloadRequest } from 'payload'

import { authDatabase } from './transaction'

type Database = ReturnType<typeof authDatabase>

export function issuedSessionId(token: string) {
  const { sid } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
  if (typeof sid !== 'string') throw new Error('Missing issued customer session ID')
  return sid
}

export async function captureCredentialEpoch(req: PayloadRequest, email: string) {
  const db = req.transactionID ? authDatabase(req) : req.payload.db.drizzle
  const { rows } = await db.execute<{ credential_epoch: string | null }>(sql`
    SELECT mfa.credential_epoch FROM customers
    LEFT JOIN rheino_auth.customer_mfa mfa ON mfa.customer_id = customers.id
    WHERE customers.email = ${email.trim().toLowerCase()}
  `)
  req.context.customerCredentialEpoch = rows[0]?.credential_epoch ?? null
}

export async function advanceCredentialEpoch(db: Database, customerId: number) {
  await db.execute(sql`
    INSERT INTO rheino_auth.customer_mfa (customer_id, credential_epoch)
    VALUES (${customerId}, ${randomUUID()})
    ON CONFLICT (customer_id) DO UPDATE SET credential_epoch = excluded.credential_epoch
  `)
}

export async function grantCustomerSession(req: PayloadRequest, customerId: number, token: string) {
  const db = authDatabase(req)
  const sid = issuedSessionId(token)
  await db.execute(sql`
    DELETE FROM rheino_auth.customer_session_grants
    WHERE customer_id = ${customerId} AND expires_at <= clock_timestamp()
  `)
  const { rows } = await db.execute(sql`
    INSERT INTO rheino_auth.customer_session_grants (id, customer_id, expires_at)
    SELECT id, _parent_id, expires_at FROM customers_sessions
    WHERE id = ${sid} AND _parent_id = ${customerId}
    RETURNING id
  `)
  if (!rows.length) throw new Error('Customer session is unavailable')
}

export async function hasCustomerSessionGrant(
  db: Pick<Database, 'execute'>,
  customerId: number,
  sid: string,
) {
  const { rows } = await db.execute(sql`
    SELECT 1 FROM rheino_auth.customer_session_grants
    WHERE id = ${sid} AND customer_id = ${customerId} AND expires_at > clock_timestamp()
  `)
  return rows.length === 1
}

export async function revokeCustomerSessions(db: Database, customerId: number, keep?: string) {
  const except = keep ? sql`AND id <> ${keep}` : sql``
  await db.execute(sql`DELETE FROM customers_sessions WHERE _parent_id = ${customerId} ${except}`)
  await db.execute(
    sql`DELETE FROM rheino_auth.customer_session_grants WHERE customer_id = ${customerId} ${except}`,
  )
}

export async function revokeCustomerSession(db: Database, customerId: number, sid: string) {
  await db.execute(
    sql`DELETE FROM customers_sessions WHERE _parent_id = ${customerId} AND id = ${sid}`,
  )
  await db.execute(
    sql`DELETE FROM rheino_auth.customer_session_grants WHERE customer_id = ${customerId} AND id = ${sid}`,
  )
}
