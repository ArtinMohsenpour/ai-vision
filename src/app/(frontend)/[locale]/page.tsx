import { getTranslations } from 'next-intl/server'

import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('home', props)
}

/** Home is the `home` global. Until it is published, a short placeholder from the messages is shown. */
export default async function HomePage(props: PageProps) {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'Home' })
  return (
    <WebsitePageView
      slug="home"
      {...props}
      fallback={{ eyebrow: t('eyebrow'), title: t('title'), subtitle: t('body') }}
    />
  )
}
