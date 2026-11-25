import { redirect } from 'next/navigation'

import { accountLocale, accountMetadata, type AuthPageProps } from '@/components/account/auth-page'
import { PortalOrders } from '@/components/account/portal-orders'
import { PortalShell } from '@/components/account/portal-shell'
import { localizedPath } from '@/i18n/routing'
import { getCustomerSession } from '@/lib/customer-auth/session'
import { isVisibleOrder } from '@/lib/shop/order-visibility'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: AuthPageProps) {
  return accountMetadata(params, 'ordersTitle')
}

export default async function AccountOrdersPage({ params }: AuthPageProps) {
  const locale = await accountLocale(params)
  const session = await getCustomerSession()
  if (!session) redirect(localizedPath(locale, '/login?next=%2Faccount%2Forders'))
  const { payload, user } = session
  const { docs } = await payload.find({
    collection: 'orders',
    user,
    overrideAccess: false,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })
  return (
    <PortalShell section="orders" user={user} locale={locale}>
      <PortalOrders orders={docs.filter((order) => isVisibleOrder(order))} locale={locale} />
    </PortalShell>
  )
}
