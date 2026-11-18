import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

/** Placeholder start page. Replaced by the Payload-driven `home` global in phase B. */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Home')
  const otherLocale = locale === 'de' ? 'en' : 'de'

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <p className="text-muted text-sm font-medium tracking-widest uppercase">{t('eyebrow')}</p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t('title')}
      </h1>
      <p className="text-muted max-w-prose text-lg">{t('body')}</p>
      <Link
        href="/"
        locale={otherLocale}
        className="border-border hover:border-primary w-fit rounded-full border px-4 py-2 text-sm"
      >
        {t('switchLanguage')}
      </Link>
    </main>
  )
}
