import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('about', props)
}

export default function AboutPage(props: PageProps) {
  return <WebsitePageView slug="about" {...props} />
}
