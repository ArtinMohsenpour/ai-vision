import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('terms', props)
}

export default function TermsPage(props: PageProps) {
  return <WebsitePageView slug="terms" {...props} />
}
