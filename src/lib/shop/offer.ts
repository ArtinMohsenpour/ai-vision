import type { Service } from '@/payload-types'
import { orderingConfig } from './config'
import { orderPageData, type OrderPageData } from './order-page'
import type { VatRate } from './types'

/**
 * What a "Package and price" content item shows for a service (src/components/site/offer.tsx):
 * - `order`: online ordering is open; the button leads to the order page.
 * - `inquiry`: the service is set up for ordering but the shop is closed; same package and
 *   prices, with a contact button instead.
 * - `quote`: "price on request" with a quote button.
 * Null when the service has no ordering (or incomplete ordering settings).
 */
export type OfferView =
  | ({ kind: 'order' | 'inquiry' } & OrderPageData)
  | { kind: 'quote'; slug: string; title: string; priceNote: string }

export function offerView(
  service: Service,
  settings: { vatRate: VatRate; priceNote: string; orderingEnabled: boolean },
): OfferView | null {
  const mode = orderingConfig(service).mode
  if (mode === 'quote')
    return {
      kind: 'quote',
      slug: service.slug,
      title: service.title,
      priceNote: settings.priceNote,
    }
  const data = orderPageData(service, settings)
  if (!data) return null
  return { kind: settings.orderingEnabled ? 'order' : 'inquiry', ...data }
}
