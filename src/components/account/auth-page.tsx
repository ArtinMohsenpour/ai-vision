import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { localizedPath, type Locale } from '@/i18n/routing'
import { submitCustomerAuth } from '@/lib/customer-auth/actions'
import type { AuthMode } from '@/lib/customer-auth/policy'
import { getCustomer } from '@/lib/customer-auth/session'
import { SITE_NAME } from '@/lib/website/metadata'
import { AccountShell } from './account-shell'
import { CustomerForm } from './customer-form'

export type AuthPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}

export async function accountLocale(params: AuthPageProps['params']): Promise<Locale> {
  const { locale } = await params
  if (locale !== 'de' && locale !== 'en') notFound()
  setRequestLocale(locale)
  return locale
}

export async function accountMetadata(
  params: AuthPageProps['params'],
  title: string,
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CustomerAuth' })
  return {
    title: `${t(title)} | ${SITE_NAME}`,
    robots: { index: false, follow: false },
    // Keep the Origin header on native form posts. Email link tokens live in URL fragments.
    referrer: 'same-origin',
  }
}

export async function AuthPage({ mode, params, searchParams }: AuthPageProps & { mode: AuthMode }) {
  const locale = await accountLocale(params)
  if ((mode === 'login' || mode === 'signup') && (await getCustomer())) {
    redirect(localizedPath(locale, '/account'))
  }
  const { status } = await searchParams
  return (
    <AccountShell>
      <CustomerForm
        mode={mode}
        action={submitCustomerAuth.bind(null, mode, locale)}
        status={
          status === 'verified'
            ? 'verified'
            : status === 'reset'
              ? 'resetDone'
              : status === 'invalid-link' && mode === 'verify-email'
                ? 'invalidLink'
                : undefined
        }
      />
    </AccountShell>
  )
}
