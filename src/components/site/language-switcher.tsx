'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type MouseEvent } from 'react'

import { usePathname } from '@/i18n/navigation'
import { localizedPath, routing, type Locale } from '@/i18n/routing'

/** Matches the thumb's transition, so the slide finishes before the page changes language. */
const SLIDE_MS = 200

/**
 * DE/EN toggle with a sliding thumb. Each option is a real link to the same page in that language,
 * so it works without JavaScript and in a new tab.
 */
export function LanguageSwitcher({ label }: { label: string }) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  // The thumb moves to the chosen language at once; the page follows when the slide has finished.
  const [selected, setSelected] = useState<Locale | null>(null)
  const [renderedLocale, setRenderedLocale] = useState(locale)
  if (renderedLocale !== locale) {
    // The language changed (switch done, or back/forward navigation): show the real one again.
    setRenderedLocale(locale)
    setSelected(null)
  }
  const shown = selected ?? locale
  const index = routing.locales.indexOf(shown)

  function choose(event: MouseEvent<HTMLAnchorElement>, code: Locale) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    event.preventDefault()
    if (code === shown) return
    setSelected(code)
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : SLIDE_MS
    setTimeout(() => router.push(localizedPath(code, pathname), { scroll: false }), delay)
  }

  return (
    <div className="bg-foreground/[0.06] relative h-9 shrink-0 rounded-full p-1">
      <span
        aria-hidden="true"
        className="bg-surface dark:bg-foreground/15 absolute inset-y-1 left-1 rounded-full shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out motion-reduce:transition-none dark:ring-white/10"
        style={{
          width: `calc((100% - 0.5rem) / ${routing.locales.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      <ul
        aria-label={label}
        className="relative grid h-full auto-cols-fr grid-flow-col text-xs font-semibold tracking-wide"
      >
        {routing.locales.map((code) => (
          <li key={code} className="relative">
            <Link
              // Direct URLs (/about, /en/about), so switching never goes through a redirect.
              href={localizedPath(code, pathname)}
              hrefLang={code}
              lang={code}
              aria-current={code === locale ? 'true' : undefined}
              onClick={(event) => choose(event, code)}
              className={`flex h-full min-w-9 items-center justify-center rounded-full px-2 uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary ${
                code === shown ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`}
            >
              {code}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
