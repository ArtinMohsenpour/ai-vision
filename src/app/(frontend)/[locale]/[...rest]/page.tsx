import { notFound } from 'next/navigation'

/** Unknown paths inside /de or /en render the localized not-found page with navbar and footer. */
export default function CatchAll() {
  notFound()
}
