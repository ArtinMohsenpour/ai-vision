import { notFound, redirect } from 'next/navigation'

import { accountLocale, accountMetadata } from '@/components/account/auth-page'
import { PortalOrder } from '@/components/account/portal-order'
import { PortalShell } from '@/components/account/portal-shell'
import { localizedPath } from '@/i18n/routing'
import { getCustomerSession } from '@/lib/customer-auth/session'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ checkout?: string }>
}

export function generateMetadata({ params }: Props) {
  return accountMetadata(params, 'ordersTitle')
}

export default async function AccountOrderPage({ params, searchParams }: Props) {
  const locale = await accountLocale(params)
  const { id } = await params
  const orderId = Number(id)
  if (!/^\d{1,10}$/.test(id) || !Number.isSafeInteger(orderId)) notFound()
  const session = await getCustomerSession()
  if (!session)
    redirect(
      localizedPath(locale, `/login?next=${encodeURIComponent(`/account/orders/${orderId}`)}`),
    )
  const { payload, user } = session
  // Read as the customer: access control returns only their own orders.
  const order = await payload
    .findByID({ collection: 'orders', id: orderId, user, overrideAccess: false, depth: 0 })
    .catch(() => null)
  if (!order) notFound()
  const { checkout } = await searchParams
  return (
    <PortalShell section="orders" user={user} locale={locale}>
      <PortalOrder order={order} locale={locale} returning={checkout === 'return'} />
    </PortalShell>
  )
}
