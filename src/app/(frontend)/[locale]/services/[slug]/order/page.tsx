import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { OrderConfigurator } from '@/components/shop/order-configurator'
import { isSlug } from '@/fields/slug'
import { orderPath, type WebsiteLocale } from '@/lib/pages'
import { startCheckout } from '@/lib/shop/actions'
import { orderPageData } from '@/lib/shop/order-page'
import { loadService, loadShopSettings } from '@/lib/website/load'
import { SITE_NAME, seoMetadata } from '@/lib/website/metadata'

type Props = { params: Promise<{ locale: string; slug: string }> }

// Rendered on first visit, then cached until content is published (like the service page).
export function generateStaticParams() {
  return []
}

async function load(params: Props['params']) {
  const { locale, slug } = await params
  const lang = locale as WebsiteLocale
  if (!isSlug(slug)) return { locale: lang, data: null }
  const [service, settings] = await Promise.all([loadService(slug, lang), loadShopSettings(lang)])
  const data = service && settings.orderingEnabled ? orderPageData(service, settings) : null
  return { locale: lang, data }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, data } = await load(params)
  if (!data) return {}
  const t = await getTranslations({ locale, namespace: 'Shop' })
  return seoMetadata({
    path: orderPath(data.slug),
    seo: null,
    fallbackTitle: `${data.title} – ${t('orderTitle')} | ${SITE_NAME}`,
    fallbackDescription: t('intro'),
    locale,
  })
}

export default async function OrderPage({ params }: Props) {
  const { locale, data } = await load(params)
  setRequestLocale(locale)
  if (!data) notFound()
  return <OrderConfigurator data={data} action={startCheckout.bind(null, locale, data.slug)} />
}
