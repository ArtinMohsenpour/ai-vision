import { redirect } from 'next/navigation'

import { accountLocale, accountMetadata, type AuthPageProps } from '@/components/account/auth-page'
import { PortalSecurity } from '@/components/account/portal-security'
import { PortalShell } from '@/components/account/portal-shell'
import { localizedPath } from '@/i18n/routing'
import { customerMfaEnabled } from '@/lib/customer-auth/mfa'
import { updateCustomerSecurity } from '@/lib/customer-auth/portal-actions'
import { getCustomerSession } from '@/lib/customer-auth/session'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: AuthPageProps) {
  return accountMetadata(params, 'securityTitle')
}

export default async function AccountSecurityPage({ params }: AuthPageProps) {
  const locale = await accountLocale(params)
  const session = await getCustomerSession()
  if (!session) redirect(localizedPath(locale, '/login'))
  const { payload, user } = session
  return (
    <PortalShell section="security" user={user} locale={locale}>
      <PortalSecurity
        enabled={await customerMfaEnabled(payload, user.id)}
        password={updateCustomerSecurity.bind(null, 'password', locale)}
        start={updateCustomerSecurity.bind(null, 'start', locale)}
        activate={updateCustomerSecurity.bind(null, 'activate', locale)}
        disable={updateCustomerSecurity.bind(null, 'disable', locale)}
      />
    </PortalShell>
  )
}
