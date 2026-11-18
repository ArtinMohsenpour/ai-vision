import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('impressum', props)
}

export default function ImpressumPage(props: PageProps) {
  return <WebsitePageView slug="impressum" {...props} />
}
