import { notFound } from 'next/navigation'

/** Unknown paths (German, or English under /en) render the localized not-found page with navbar and footer. */
export default function CatchAll() {
  notFound()
}
