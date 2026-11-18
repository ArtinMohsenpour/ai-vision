import { mediaPath } from '@/lib/media-url'
import type { Media } from '@/payload-types'

const fits = {
  natural: '',
  landscape: 'aspect-[4/3] object-cover',
  square: 'aspect-square object-cover',
} as const

type Source = { url?: string | null; width?: number | null }

/**
 * Responsive `srcset` from the WebP sizes Payload generated on upload (src/lib/media.ts),
 * so the server never resizes images per request. SVGs have no sizes and scale as vectors.
 * Only files from Payload's media route are rendered.
 */
export function imageSources(media: Media) {
  const sources: Source[] = [
    media.sizes?.thumbnail ?? {},
    media.sizes?.card ?? {},
    media.sizes?.wide ?? {},
    { url: media.url, width: media.width },
  ]
  const seen = new Set<number>()
  const srcSet = sources
    .map((source) => ({ path: mediaPath(source.url), width: source.width }))
    .filter((source): source is { path: string; width: number } =>
      Boolean(source.path && source.width && !seen.has(source.width) && seen.add(source.width)),
    )
    .map((source) => `${encodeURI(source.path)} ${source.width}w`)
    .join(', ')
  return { src: mediaPath(media.url)!, srcSet: srcSet || undefined }
}

export function isPublicMedia(media: unknown): media is Media {
  return Boolean(media && typeof media === 'object' && mediaPath((media as Media).url))
}

export function ResponsiveImage({
  media,
  sizes = '100vw',
  className,
  priority = false,
  alt,
}: {
  media: Media
  sizes?: string
  className?: string
  priority?: boolean
  alt?: string
}) {
  const { src, srcSet } = imageSources(media)
  return (
    // eslint-disable-next-line @next/next/no-img-element -- sizes are pre-generated WebP files
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={alt ?? media.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}

export function MediaImage({
  media,
  fit = 'natural',
  caption,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
}: {
  media: number | Media | null | undefined
  fit?: keyof typeof fits | null
  caption?: string | null
  sizes?: string
  priority?: boolean
}) {
  if (!isPublicMedia(media)) return null
  return (
    <figure className="space-y-2">
      <ResponsiveImage
        media={media}
        sizes={sizes}
        priority={priority}
        className={`h-auto w-full rounded-2xl ${fits[fit ?? 'natural']}`}
      />
      {caption && <figcaption className="text-muted text-sm">{caption}</figcaption>}
    </figure>
  )
}

/** Logo for the navbar and footer: small, so the smallest generated size is enough. */
export function Logo({ media, className }: { media: Media; className: string }) {
  return <ResponsiveImage media={media} sizes="160px" priority className={className} />
}
