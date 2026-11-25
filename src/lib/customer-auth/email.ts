import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { EmailAdapter, PayloadRequest } from 'payload'

import { localizedPath, type Locale } from '@/i18n/routing'
import { SITE_NAME } from '@/lib/website/metadata'
import { safeNextPath } from './next-path'

const devMail = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
const mailpit = process.env.NODE_ENV === 'development' && process.env.RHEINO_MAILPIT === '1'
const smtp =
  process.env.NODE_ENV !== 'test' &&
  process.env.SMTP_HOST &&
  process.env.SMTP_FROM &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
export const customerMailAvailable = Boolean(smtp || devMail)

export const emailAdapter = smtp
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM!,
      defaultFromName: SITE_NAME,
      skipVerify: true,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        requireTLS: true,
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
        connectionTimeout: 8_000,
        socketTimeout: 12_000,
      },
    })
  : mailpit
    ? nodemailerAdapter({
        defaultFromAddress: 'rheino@example.test',
        defaultFromName: SITE_NAME,
        skipVerify: true,
        transportOptions: {
          host: '127.0.0.1',
          port: 1025,
          secure: false,
          connectionTimeout: 3_000,
          socketTimeout: 5_000,
        },
      })
    : devMail
      ? localOutbox()
      : undefined

function localOutbox(): EmailAdapter<void> {
  return () => ({
    name: 'local-outbox',
    defaultFromAddress: 'rheino@example.test',
    defaultFromName: SITE_NAME,
    async sendEmail(message) {
      const folder =
        process.env.RHEINO_LOCAL_MAIL_DIR || join(process.cwd(), '.next', 'customer-mail')
      await mkdir(folder, { recursive: true, mode: 0o700 })
      await writeFile(join(folder, `${Date.now()}-${randomUUID()}.json`), JSON.stringify(message), {
        mode: 0o600,
        flag: 'wx',
      })
    },
  })
}

export function accountOrigin(origin?: string | null) {
  const configured = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')
  if (process.env.NODE_ENV === 'production') {
    if (configured.protocol !== 'https:' || configured.username || configured.password) {
      throw new Error('Configure an HTTPS NEXT_PUBLIC_SERVER_URL for customer accounts.')
    }
    return configured.origin
  }
  if (origin) {
    const local = new URL(origin)
    if (
      local.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(local.hostname)
    ) {
      return local.origin
    }
  }
  return configured.origin
}

const verificationTTL = 24 * 60 * 60_000
const sign = (secret: string, value: string) =>
  createHmac('sha256', secret)
    .update('rheino-verify:' + value)
    .digest('base64url')

function verificationCode(secret: string, token: string) {
  const value = `${Date.now() + verificationTTL}.${token}`
  return `${value}.${sign(secret, value)}`
}

export function verificationToken(secret: string, code: string) {
  if (!/^\d{13}\.[a-f0-9]{40}\.[A-Za-z0-9_-]{43}$/.test(code)) return null
  const [expiry, token, signature] = code.split('.')
  if (Number(expiry) <= Date.now()) return null
  return timingSafeEqual(Buffer.from(signature), Buffer.from(sign(secret, `${expiry}.${token}`)))
    ? token
    : null
}

export function customerEmail(kind: 'verify' | 'reset', req?: PayloadRequest, token?: string) {
  const locale: Locale = req?.context?.customerLocale === 'en' ? 'en' : 'de'
  const verify = kind === 'verify'
  const subject =
    locale === 'de'
      ? verify
        ? 'Rheino – E-Mail-Adresse bestätigen'
        : 'Rheino – Passwort zurücksetzen'
      : verify
        ? 'Rheino – Verify your email'
        : 'Rheino – Reset your password'
  const description =
    locale === 'de'
      ? verify
        ? 'Bestätigen Sie Ihre E-Mail-Adresse, um Ihren Rheino-Zugang zu aktivieren. Der Link ist 24 Stunden gültig.'
        : 'Über diesen Link können Sie ein neues Passwort für Ihr Rheino-Konto festlegen. Der Link ist 30 Minuten gültig.'
      : verify
        ? 'Verify your email to activate your Rheino account. The link expires in 24 hours.'
        : 'Use this link to set a new password for your Rheino account. The link expires in 30 minutes.'
  const ignore =
    locale === 'de'
      ? 'Wenn Sie diese Nachricht nicht angefordert haben, können Sie sie ignorieren.'
      : 'If you did not request this email, you can ignore it.'

  if (!req || !token) return { subject, html: '', text: '' }
  if (!customerMailAvailable) throw new Error('Customer email is unavailable.')
  const origin = accountOrigin(
    typeof req.context?.customerOrigin === 'string' ? req.context.customerOrigin : null,
  )
  const url = new URL(localizedPath(locale, verify ? '/verify-email' : '/reset-password'), origin)
  const next = verify ? safeNextPath(req.context?.customerNext) : null
  if (next) url.searchParams.set('next', next)
  url.hash = verify ? verificationCode(req.payload.secret, token) : token

  return {
    subject,
    html: `<p>${description}</p><p><a href="${url.href}">${subject}</a></p><p>${ignore}</p>`,
    text: `${description}\n\n${url.href}\n\n${ignore}`,
  }
}
