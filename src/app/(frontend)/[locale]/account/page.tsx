import { redirect } from 'next/navigation'

import { accountLocale, accountMetadata, type AuthPageProps } from '@/components/account/auth-page'
import { PortalProfile } from '@/components/account/portal-profile'
import { PortalShell } from '@/components/account/portal-shell'
import { localizedPath } from '@/i18n/routing'
import { saveCustomerProfile } from '@/lib/customer-auth/portal-actions'
import { getCustomer } from '@/lib/customer-auth/session'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: AuthPageProps) {
  return accountMetadata(params, 'accountTitle')
}

export default async function AccountPage({ params }: AuthPageProps) {
  const locale = await accountLocale(params)
  const user = await getCustomer()
  if (!user) redirect(localizedPath(locale, '/login'))
  return (
    <PortalShell section="profile" user={user} locale={locale}>
      <PortalProfile
        email={user.email}
        initial={{
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company ?? '',
          phone: user.phone ?? '',
          vatId: user.vatId ?? '',
          street: user.address?.street ?? '',
          postalCode: user.address?.postalCode ?? '',
          city: user.address?.city ?? '',
          country: user.address?.country ?? '',
        }}
        action={saveCustomerProfile.bind(null, locale)}
      />
    </PortalShell>
  )
}
