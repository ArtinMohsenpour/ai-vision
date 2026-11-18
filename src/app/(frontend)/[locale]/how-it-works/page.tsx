import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('how-it-works', props)
}

export default function HowItWorksPage(props: PageProps) {
  return <WebsitePageView slug="how-it-works" {...props} />
}
