import { getTranslations } from 'next-intl/server'

import { buttonClass } from '@/components/site/cms-link'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('NotFound')
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-muted">{t('body')}</p>
      <Link href="/" className={`mt-8 ${buttonClass('primary')}`}>
        {t('home')}
      </Link>
    </div>
  )
}
