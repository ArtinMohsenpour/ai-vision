import Image from 'next/image'

import type { Media } from '@/payload-types'

const fits = {
  natural: '',
  landscape: 'aspect-[4/3] object-cover',
  square: 'aspect-square object-cover',
} as const

/** Public images only come from Payload's media route (configured in next.config.ts). */
export function MediaImage({
  media,
  fit = 'natural',
  caption,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: {
  media: number | Media | null | undefined
  fit?: keyof typeof fits | null
  caption?: string | null
  sizes?: string
}) {
  if (typeof media !== 'object' || !media?.url?.startsWith('/api/media/file/')) return null
  return (
    <figure className="space-y-2">
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width || 1200}
        height={media.height || 800}
        sizes={sizes}
        className={`h-auto w-full rounded-2xl ${fits[fit ?? 'natural']}`}
      />
      {caption && <figcaption className="text-sm text-muted">{caption}</figcaption>}
    </figure>
  )
}
