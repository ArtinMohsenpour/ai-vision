import type { Payload } from 'payload'

import type { Service } from '@/payload-types'
import type { OrderingConfig, VatRate } from './types'

const OFF: OrderingConfig = {
  mode: 'off',
  baseName: '',
  basePrice: 0,
  baseDays: 0,
  depositPercent: null,
  extras: [],
}

/** The ordering settings of a service document. Incomplete online ordering counts as off. */
export function orderingConfig(service: Pick<Service, 'ordering'>): OrderingConfig {
  const ordering = service.ordering
  if (!ordering?.mode || ordering.mode === 'off') return OFF
  if (ordering.mode === 'quote') return { ...OFF, mode: 'quote' }
  const { baseName, basePrice, baseDays } = ordering
  if (!baseName || typeof basePrice !== 'number' || typeof baseDays !== 'number') return OFF
  return {
    mode: 'order',
    baseName,
    basePrice,
    baseDays,
    depositPercent: ordering.depositPercent ?? null,
    extras: (ordering.extras ?? []).flatMap((extra) =>
      extra.id && typeof extra.price === 'number'
        ? [
            {
              id: extra.id,
              title: extra.title,
              price: extra.price,
              days: extra.days ?? 0,
              active: extra.active !== false,
            },
          ]
        : [],
    ),
  }
}

export const vatRateOf = (value: unknown): VatRate => (value === '19' ? 19 : 0)

/** Uncached shop settings for checkout and webhooks (system reads, including private fields). */
export async function readShopSettings(payload: Payload) {
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  return {
    vatRate: vatRateOf(settings.vatRate),
    orderingEnabled: settings.orderingEnabled === true,
    orderNotificationEmail: settings.orderNotificationEmail || null,
  }
}
