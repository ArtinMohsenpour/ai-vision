import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('privacy', props)
}

export default function PrivacyPage(props: PageProps) {
  return <WebsitePageView slug="privacy" {...props} />
}
