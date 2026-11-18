import { WebsitePageView, websitePageMetadata, type PageProps } from '@/components/site/website-page'

export function generateMetadata(props: PageProps) {
  return websitePageMetadata('contact', props)
}

export default function ContactPage(props: PageProps) {
  return <WebsitePageView slug="contact" {...props} />
}
