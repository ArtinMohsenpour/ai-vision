import { imageSources, isPublicMedia } from '@/components/site/media-image'
import { EXTRA_ICONS, type ExtraIcon } from '@/fields/ordering'
import type { Service } from '@/payload-types'
import { orderingConfig } from './config'
import type { OrderingConfig, VatRate } from './types'

export type OrderPageExtra = {
  id: string
  title: string
  summary: string
  description: string
  includes: string[]
  price: number
  days: number
  icon: ExtraIcon
  image: { src: string; srcSet?: string; width?: number; height?: number; alt: string } | null
}

/** Display data for the order page. Only active extras; prices are for display only. */
export type OrderPageData = {
  slug: string
  title: string
  base: { name: string; description: string; includes: string[]; price: number; days: number }
  extras: OrderPageExtra[]
  vatRate: VatRate
  depositPercent: number
  priceNote: string
}

const texts = (rows: { text?: string | null }[] | null | undefined) =>
  (rows ?? []).flatMap((row) => (row.text ? [row.text] : []))

/** Null when the service cannot be ordered online. */
export function orderPageData(
  service: Service,
  settings: { vatRate: VatRate; priceNote: string },
): OrderPageData | null {
  const config = orderingConfig(service)
  if (config.mode !== 'order') return null
  const ordering = service.ordering!
  const active = new Set(config.extras.filter((extra) => extra.active).map((extra) => extra.id))
  const percent = config.depositPercent ?? 0
  return {
    slug: service.slug,
    title: service.title,
    base: {
      name: config.baseName,
      description: ordering.baseDescription ?? '',
      includes: texts(ordering.baseIncludes),
      price: config.basePrice,
      days: config.baseDays,
    },
    extras: (ordering.extras ?? [])
      .filter((extra) => extra.id && active.has(extra.id))
      .map((extra) => {
        const image = isPublicMedia(extra.image) ? extra.image : null
        return {
          id: extra.id!,
          title: extra.title,
          summary: extra.summary ?? '',
          description: extra.description ?? '',
          includes: texts(extra.includes),
          price: extra.price ?? 0,
          days: extra.days ?? 0,
          icon: (EXTRA_ICONS as readonly string[]).includes(extra.icon ?? '')
            ? (extra.icon as ExtraIcon)
            : 'generic',
          image: image
            ? {
                ...imageSources(image),
                width: image.width ?? undefined,
                height: image.height ?? undefined,
                alt: image.alt ?? '',
              }
            : null,
        }
      }),
    vatRate: settings.vatRate,
    depositPercent: percent > 0 && percent < 100 ? percent : 0,
    priceNote: settings.priceNote,
  }
}

/** The same data as an ordering configuration, for display totals in the browser. */
export function displayConfig(data: OrderPageData): OrderingConfig {
  return {
    mode: 'order',
    baseName: data.base.name,
    basePrice: data.base.price,
    baseDays: data.base.days,
    depositPercent: data.depositPercent,
    extras: data.extras.map((extra) => ({
      id: extra.id,
      title: extra.title,
      price: extra.price,
      days: extra.days,
      active: true,
    })),
  }
}
