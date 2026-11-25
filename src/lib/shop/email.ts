import type { Payload } from 'payload'

import { localizedPath } from '@/i18n/routing'
import { accountOrigin } from '@/lib/customer-auth/email'
import type { Order } from '@/payload-types'
import { readShopSettings } from './config'
import { formatEuros } from './money'

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )

const localeOf = (order: Order): 'de' | 'en' => (order.locale === 'en' ? 'en' : 'de')

async function customerAddress(payload: Payload, order: Order) {
  if (typeof order.customer === 'object' && order.customer?.email) return order.customer.email
  const id = typeof order.customer === 'object' ? order.customer?.id : order.customer
  if (!id) return null
  const customer = await payload
    .findByID({
      collection: 'customers',
      id,
      depth: 0,
      overrideAccess: true,
      select: { email: true },
    })
    .catch(() => null)
  return customer?.email ?? null
}

function orderLink(order: Order) {
  return new URL(localizedPath(localeOf(order), `/account/orders/${order.id}`), accountOrigin(null))
    .href
}

function lineItems(order: Order) {
  const locale = localeOf(order)
  const euros = (cents: number | null | undefined) => formatEuros(cents ?? 0, locale)
  const rows = [
    [order.snapshot.baseName ?? order.snapshot.serviceTitle ?? '', order.snapshot.basePrice],
    ...(order.snapshot.extras ?? []).map(
      (extra) => [`+ ${extra.title ?? ''}`, extra.price] as const,
    ),
  ] as const
  const list = rows
    .map(([name, price]) => `<li>${escapeHtml(String(name))}: ${euros(price as number)}</li>`)
    .join('')
  const text = rows.map(([name, price]) => `${name}: ${euros(price as number)}`).join('\n')
  return { list: `<ul>${list}</ul>`, text }
}

/** "Payment received" to the customer and a short note to the owner. */
export async function sendPaymentEmails(payload: Payload, order: Order) {
  const locale = localeOf(order)
  const de = locale === 'de'
  const euros = (cents: number | null | undefined) => formatEuros(cents ?? 0, locale)
  const number = order.number ?? `#${order.id}`
  const link = orderLink(order)
  const items = lineItems(order)
  const balance = order.balanceDue ?? 0

  const to = await customerAddress(payload, order)
  if (to) {
    const subject = de
      ? `Rheino – Zahlung erhalten (${number})`
      : `Rheino – Payment received (${number})`
    const intro = de
      ? `Vielen Dank! Wir haben Ihre Zahlung für die Bestellung ${number} erhalten.`
      : `Thank you! We have received your payment for order ${number}.`
    const paid = de ? `Bezahlt: ${euros(order.amountPaid)}` : `Paid: ${euros(order.amountPaid)}`
    const open = balance
      ? de
        ? `Offener Restbetrag: ${euros(balance)}. Wir melden uns, wenn er fällig wird.`
        : `Remaining balance: ${euros(balance)}. We'll let you know when it is due.`
      : ''
    const view = de ? 'Bestellung ansehen' : 'View your order'
    await payload.sendEmail({
      to,
      subject,
      html: `<p>${intro}</p>${items.list}<p>${paid}</p>${open ? `<p>${open}</p>` : ''}<p><a href="${link}">${view}</a></p>`,
      text: `${intro}\n\n${items.text}\n\n${paid}\n${open}\n\n${link}`,
    })
  }

  const { orderNotificationEmail } = await readShopSettings(payload)
  if (orderNotificationEmail) {
    const admin = new URL(`/admin/collections/orders/${order.id}`, accountOrigin(null)).href
    const summary = `${number} · ${order.snapshot.serviceTitle ?? ''} · paid ${formatEuros(order.amountPaid ?? 0, 'en')}${balance ? ` · balance ${formatEuros(balance, 'en')}` : ''}`
    await payload.sendEmail({
      to: orderNotificationEmail,
      subject: `Rheino – Payment received: ${number}`,
      html: `<p>${escapeHtml(summary)}</p>${items.list}<p><a href="${admin}">Open the order in the admin</a></p>`,
      text: `${summary}\n\n${items.text}\n\n${admin}`,
    })
  }
}

/** Sent once when the owner turns on "Request remaining balance". */
export async function sendBalanceRequestEmail(payload: Payload, order: Order) {
  const to = await customerAddress(payload, order)
  if (!to) return
  const de = localeOf(order) === 'de'
  const number = order.number ?? `#${order.id}`
  const amount = formatEuros(order.balanceDue ?? 0, localeOf(order))
  const link = orderLink(order)
  const subject = de
    ? `Rheino – Restbetrag fällig (${number})`
    : `Rheino – Remaining balance due (${number})`
  const body = de
    ? `Der Restbetrag von ${amount} für Ihre Bestellung ${number} ist jetzt fällig. Sie können ihn in Ihrem Konto sicher über Stripe bezahlen.`
    : `The remaining balance of ${amount} for your order ${number} is now due. You can pay it securely through Stripe in your account.`
  const action = de ? 'Restbetrag bezahlen' : 'Pay the remaining balance'
  await payload.sendEmail({
    to,
    subject,
    html: `<p>${body}</p><p><a href="${link}">${action}</a></p>`,
    text: `${body}\n\n${link}`,
  })
}
