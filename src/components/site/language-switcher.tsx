'use client'

import { useLocale } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/** Links to the same page in the other languages. */
export function LanguageSwitcher({ label }: { label: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  return (
    <ul aria-label={label} className="flex items-center gap-1 text-sm font-medium">
      {routing.locales.map((code) => (
        <li key={code}>
          <Link
            href={pathname}
            locale={code}
            hrefLang={code}
            lang={code}
            aria-current={code === locale ? 'true' : undefined}
            className={`rounded-full px-2.5 py-1.5 uppercase transition-colors ${
              code === locale ? 'bg-accent text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            {code}
          </Link>
        </li>
      ))}
    </ul>
  )
}
