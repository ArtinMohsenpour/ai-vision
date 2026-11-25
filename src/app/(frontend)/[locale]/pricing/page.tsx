import { PricingGrid } from '@/components/shop/pricing-grid'
import {
  WebsitePageView,
  websitePageMetadata,
  type PageProps,
} from '@/components/site/website-page'
import type { WebsiteLocale } from '@/lib/pages'
import { loadServices, loadShopSettings } from '@/lib/website/load'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('pricing', props)
}

export default async function PricingPage(props: PageProps) {
  const locale = (await props.params).locale as WebsiteLocale
  const [services, settings] = await Promise.all([loadServices(locale), loadShopSettings(locale)])
  return (
    <WebsitePageView
      slug="pricing"
      {...props}
      afterHeading={<PricingGrid services={services} settings={settings} locale={locale} />}
    />
  )
}
