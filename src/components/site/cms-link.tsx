import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { resolveLink, type StoredLink } from '@/lib/links'

/**
 * Renders a CMS link group (src/fields/link.ts). Hook-free, so server and client components share it.
 * Unsafe or incomplete links render nothing. Internal paths get the active locale prefix.
 */
export function CmsLink({
  link,
  className,
  newTabLabel,
  children,
  ...rest
}: {
  link: StoredLink | null | undefined
  className?: string
  newTabLabel?: string
  children: ReactNode
  'aria-current'?: 'page'
  onClick?: () => void
}) {
  const resolved = resolveLink(link)
  if (!resolved) return null
  const props = {
    className,
    target: resolved.newTab ? '_blank' : undefined,
    rel: resolved.newTab ? 'noopener noreferrer' : undefined,
    ...rest,
  }
  const content = (
    <>
      {children}
      {resolved.newTab && newTabLabel && <span className="sr-only"> ({newTabLabel})</span>}
    </>
  )
  return resolved.external ? (
    <a href={resolved.href} {...props}>
      {content}
    </a>
  ) : (
    <Link href={resolved.href} {...props}>
      {content}
    </Link>
  )
}

export const buttonClass = (appearance?: string | null) =>
  `inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${
    appearance === 'secondary'
      ? 'border border-border bg-surface text-foreground hover:border-primary'
      : 'bg-primary text-primary-foreground hover:bg-primary/85'
  }`
