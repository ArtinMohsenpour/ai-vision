import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('services-overview', props)
}

export default function ServicesPage(props: PageProps) {
  return <WebsitePageView slug="services-overview" {...props} />
}
