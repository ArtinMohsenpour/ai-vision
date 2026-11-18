import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('faq', props)
}

export default function FaqPage(props: PageProps) {
  return <WebsitePageView slug="faq" {...props} />
}
