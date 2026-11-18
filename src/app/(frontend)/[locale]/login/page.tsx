import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buttonClass } from '@/components/site/cms-link'
import { Link } from '@/i18n/navigation'
import { SITE_NAME } from '@/lib/website/metadata'

type Props = { params: Promise<{ locale: string }> }

/** Placeholder for the customer login (PLAN.md, phase D). The navbar's login button links here. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Login' })
  return { title: `${t('title')} | ${SITE_NAME}`, robots: { index: false } }
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Login')
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-muted mt-4 leading-relaxed">{t('body')}</p>
      <Link href="/contact" className={`mt-8 ${buttonClass('primary')}`}>
        {t('contact')}
      </Link>
    </div>
  )
}
