import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('pricing', props)
}

export default function PricingPage(props: PageProps) {
  return <WebsitePageView slug="pricing" {...props} />
}
