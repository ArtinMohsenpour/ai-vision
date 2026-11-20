import { sql } from '@payloadcms/db-postgres'
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { Secret, TOTP } from 'otpauth'
import { AuthenticationError, type Payload, type PayloadRequest } from 'payload'
import QRCode from 'qrcode'

import { authDatabase } from './transaction'

const period = 30
const recoveryCount = 8
const setupMinutes = 10
const setupKey = (secret: string) =>
  createHmac('sha256', secret).update('rheino-mfa-encryption-v1').digest()

class CustomerSecondFactorError extends Error {
  constructor(readonly code: 'secondFactorRequired' | 'invalidSecondFactor') {
    super(code)
    this.name = 'CustomerSecondFactorError'
  }
}

export function secondFactorError(error: unknown) {
  // Payload hooks and Next server actions can run with separate module instances.
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'CustomerSecondFactorError' &&
    'code' in error &&
    (error.code === 'secondFactorRequired' || error.code === 'invalidSecondFactor')
  ) {
    return error.code
  }
}

function encrypt(secret: string, customerId: number, text: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', setupKey(secret), iv)
  cipher.setAAD(Buffer.from(String(customerId)))
  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url')
}

function decrypt(secret: string, customerId: number, value: string) {
  const data = Buffer.from(value, 'base64url')
  const decipher = createDecipheriv('aes-256-gcm', setupKey(secret), data.subarray(0, 12))
  decipher.setAAD(Buffer.from(String(customerId)))
  decipher.setAuthTag(data.subarray(12, 28))
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8')
}

const authenticator = (secret: Secret, email = '') =>
  new TOTP({ issuer: 'Rheino', label: email, secret, period, digits: 6, algorithm: 'SHA1' })

function matchingStep(secret: string, code: string, timestamp = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null
  const delta = authenticator(Secret.fromBase32(secret)).validate({
    token: code,
    timestamp,
    window: 1,
  })
  return delta === null ? null : Math.floor(timestamp / (period * 1000)) + delta
}

const recoveryHash = (secret: string, customerId: number, code: string) =>
  createHmac('sha256', secret).update(`rheino-mfa-recovery-v1:${customerId}:${code}`).digest('hex')

export async function customerMfaEnabled(payload: Payload, customerId: number) {
  const { rows } = await payload.db.drizzle.execute(sql`
    SELECT 1 FROM rheino_auth.customer_mfa WHERE customer_id = ${customerId} AND secret IS NOT NULL
  `)
  return rows.length > 0
}

/** Called inside Payload's login transaction before it signs a customer session. */
export async function verifyCustomerLogin(req: PayloadRequest, customerId: number) {
  const db = authDatabase(req)
  // Serialize factor use and security changes with updates to this customer.
  const { rows: customer } = await db.execute(sql`
    SELECT id FROM customers WHERE id = ${customerId}
      AND _verified IS TRUE AND suspended IS NOT TRUE FOR UPDATE
  `)
  if (!customer.length) throw new AuthenticationError(req.t)

  const { rows } = await db.execute<{
    credential_epoch: string | null
    secret: string | null
    last_step: string | number | null
    recovery_hashes: string[]
  }>(sql`
    SELECT credential_epoch, secret, last_step, recovery_hashes FROM rheino_auth.customer_mfa
    WHERE customer_id = ${customerId} FOR UPDATE
  `)
  const factor = rows[0]
  if ((req.context.customerCredentialEpoch ?? null) !== (factor?.credential_epoch ?? null))
    throw new AuthenticationError(req.t)
  if (!factor?.secret) return

  const input = req.context.customerFactor
  if (typeof input !== 'string' || !input)
    throw new CustomerSecondFactorError('secondFactorRequired')
  const code = input.trim()
  const step = matchingStep(decrypt(req.payload.secret, customerId, factor.secret), code)
  if (step !== null && (factor.last_step === null || step > Number(factor.last_step))) {
    await db.execute(
      sql`UPDATE rheino_auth.customer_mfa SET last_step = ${step} WHERE customer_id = ${customerId}`,
    )
    return
  }

  const hex = code.replaceAll('-', '').toLowerCase()
  if (/^[a-f0-9]{20}$/.test(hex)) {
    const hash = recoveryHash(req.payload.secret, customerId, hex)
    const matches = factor.recovery_hashes.some((stored) =>
      timingSafeEqual(Buffer.from(stored, 'hex'), Buffer.from(hash, 'hex')),
    )
    if (matches) {
      await db.execute(sql`
        UPDATE rheino_auth.customer_mfa
        SET recovery_hashes = array_remove(recovery_hashes, ${hash})
        WHERE customer_id = ${customerId}
      `)
      return
    }
  }
  throw new CustomerSecondFactorError('invalidSecondFactor')
}

type AuthDb = ReturnType<typeof authDatabase>

export async function prepareAuthenticator(
  db: AuthDb,
  payload: Payload,
  customer: { id: number; email: string; sid: string },
) {
  const secret = new Secret({ size: 20 })
  const qr = await QRCode.toDataURL(authenticator(secret, customer.email).toString(), {
    width: 224,
    margin: 3,
    errorCorrectionLevel: 'M',
  })
  const { rows } = await db.execute(sql`
    INSERT INTO rheino_auth.customer_mfa (customer_id, pending_secret, pending_session_id, pending_expires_at)
    VALUES (${customer.id}, ${encrypt(payload.secret, customer.id, secret.base32)}, ${customer.sid},
      clock_timestamp() + ${setupMinutes} * interval '1 minute')
    ON CONFLICT (customer_id) DO UPDATE SET pending_secret = excluded.pending_secret,
      pending_session_id = excluded.pending_session_id, pending_expires_at = excluded.pending_expires_at
    WHERE customer_mfa.secret IS NULL
    RETURNING customer_id
  `)
  return rows.length ? { key: secret.base32, qr } : undefined
}

export async function activateAuthenticator(
  db: AuthDb,
  payload: Payload,
  customerId: number,
  sid: string,
  code: string,
) {
  const { rows } = await db.execute<{ pending_secret: string }>(sql`
    SELECT pending_secret FROM rheino_auth.customer_mfa
    WHERE customer_id = ${customerId} AND pending_session_id = ${sid} AND secret IS NULL
      AND pending_expires_at > clock_timestamp()
    FOR UPDATE
  `)
  const pending = rows[0]?.pending_secret
  if (!pending) return { message: 'setupExpired' } as const
  const step = matchingStep(decrypt(payload.secret, customerId, pending), code)
  if (step === null) return { message: 'invalidSecondFactor' } as const

  const codes = Array.from({ length: recoveryCount }, () => randomBytes(10).toString('hex'))
  const hashes = codes.map((value) => sql`${recoveryHash(payload.secret, customerId, value)}`)
  await db.execute(sql`
    UPDATE rheino_auth.customer_mfa
    SET secret = pending_secret, last_step = ${step}, recovery_hashes = ARRAY[${sql.join(hashes, sql`, `)}]::text[],
      pending_secret = NULL, pending_session_id = NULL, pending_expires_at = NULL
    WHERE customer_id = ${customerId}
  `)
  return { recoveryCodes: codes.map((value) => value.match(/.{4}/g)!.join('-')) }
}
