import { useTranslations } from 'next-intl'

import type { OrderPageExtra } from '@/lib/shop/order-page'
import { ExtraIcon } from './extra-icons'

function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="mt-1 shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  )
}

/** What the customer gets with one extra: image or icon, description and the "what you get" list. */
export function ExtraPreview({ extra }: { extra: OrderPageExtra | undefined }) {
  const t = useTranslations('Shop')
  if (!extra) return <p className="p-5 text-sm text-muted">{t('previewHint')}</p>
  return (
    <div>
      <div
        className={`flex items-center justify-center overflow-hidden border-b border-border bg-accent text-primary ${
          extra.image ? 'aspect-[16/9]' : 'h-28'
        }`}
      >
        {extra.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- sizes are pre-generated WebP files
          <img
            src={extra.image.src}
            srcSet={extra.image.srcSet}
            sizes="(min-width: 1024px) 420px, 100vw"
            width={extra.image.width}
            height={extra.image.height}
            alt={extra.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ExtraIcon name={extra.icon} size={40} />
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold">{extra.title}</h3>
        {extra.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{extra.description}</p>
        )}
        {extra.includes.length > 0 && (
          <>
            <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
              {t('whatYouGet')}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {extra.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
