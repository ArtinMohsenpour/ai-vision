'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { resolveLink, type StoredLink } from '@/lib/links'
import { LOGIN_PATH } from '@/lib/pages'
import type { Navbar } from '@/payload-types'
import { BrandLogo } from './brand-logo'
import { buttonClass, CmsLink } from './cms-link'
import { LanguageSwitcher } from './language-switcher'
import { isPublicMedia, Logo } from './media-image'
import { ThemeToggle } from './theme'

type NavbarLabels = Record<
  'home' | 'label' | 'menu' | 'closeMenu' | 'skip' | 'language' | 'newTab' | 'login' | 'theme',
  string
>
type Item = NonNullable<Navbar['items']>[number]
type Variant = 'bar' | 'menu'

const normalize = (path: string) => path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'

function isActive(link: StoredLink | null | undefined, pathname: string) {
  const resolved = resolveLink(link)
  return Boolean(resolved && !resolved.external && normalize(resolved.href) === normalize(pathname))
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const linkClass = (active: boolean, variant: Variant) =>
  `flex items-center gap-1.5 font-medium transition-colors motion-reduce:transition-none ${focusRing} ${
    variant === 'bar'
      ? 'rounded-full px-3 py-2 text-sm'
      : 'w-full justify-between rounded-xl px-3 py-3 text-base'
  } ${active ? 'text-foreground bg-foreground/5' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`

function subscribeToScroll(onChange: () => void) {
  addEventListener('scroll', onChange, { passive: true })
  return () => removeEventListener('scroll', onChange)
}
const atPageTop = () => scrollY < 8

/** Grid-rows trick: animates height from 0 to auto. */
const collapse = (open: boolean) =>
  `grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
  }`

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Popover in the bar, accordion in the phone menu. */
function Dropdown({
  item,
  variant,
  pathname,
  labels,
  onNavigate,
}: {
  item: Item
  variant: Variant
  pathname: string
  labels: NavbarLabels
  onNavigate: () => void
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLLIElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = `nav-${variant}-${item.id}`
  const active = item.children?.some((child) => isActive(child.link, pathname)) ?? false

  useEffect(() => {
    if (!open || variant === 'menu') return
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open, variant])

  const children = item.children?.map((child) => {
    const childActive = isActive(child.link, pathname)
    return (
      <li key={child.id}>
        <CmsLink
          link={child.link}
          newTabLabel={labels.newTab}
          aria-current={childActive ? 'page' : undefined}
          onClick={() => {
            setOpen(false)
            onNavigate()
          }}
          className={`block rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/5 motion-reduce:transition-none ${focusRing}`}
        >
          <span className={`block text-sm font-medium ${childActive ? 'text-primary' : ''}`}>
            {child.label}
          </span>
          {child.description && (
            <span className="text-muted mt-0.5 block text-xs leading-relaxed">
              {child.description}
            </span>
          )}
        </CmsLink>
      </li>
    )
  })

  return (
    <li
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (variant === 'bar' && !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpen(false)
          trigger.current?.focus()
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={linkClass(active || open, variant)}
      >
        {item.label}
        <Chevron open={open} />
      </button>
      {variant === 'bar' ? (
        <ul
          id={id}
          className={`border-border bg-surface absolute top-full left-0 z-40 mt-2 w-72 space-y-0.5 rounded-2xl border p-2 shadow-xl shadow-black/5 transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:transition-none ${
            open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
          }`}
        >
          {children}
        </ul>
      ) : (
        <div id={id} inert={!open} className={collapse(open)}>
          <ul className="min-h-0 overflow-hidden pl-3">{children}</ul>
        </div>
      )}
    </li>
  )
}

function NavItems({
  items,
  variant,
  pathname,
  labels,
  onNavigate,
}: {
  items: Item[]
  variant: Variant
  pathname: string
  labels: NavbarLabels
  onNavigate: () => void
}) {
  return items.map((item) =>
    item.type === 'dropdown' ? (
      <Dropdown
        key={item.id}
        item={item}
        variant={variant}
        pathname={pathname}
        labels={labels}
        onNavigate={onNavigate}
      />
    ) : (
      <li key={item.id}>
        <CmsLink
          link={item.link}
          newTabLabel={labels.newTab}
          onClick={onNavigate}
          aria-current={isActive(item.link, pathname) ? 'page' : undefined}
          className={linkClass(isActive(item.link, pathname), variant)}
        >
          {item.label}
        </CmsLink>
      </li>
    ),
  )
}

/** CMS call-to-action buttons and the customer login. */
function Actions({
  buttons,
  labels,
  variant,
  onNavigate,
}: {
  buttons: Item[]
  labels: NavbarLabels
  variant: Variant
  onNavigate: () => void
}) {
  const size = variant === 'bar' ? 'compact' : 'default'
  const width = variant === 'menu' ? 'w-full' : ''
  return (
    <>
      <Link
        href={LOGIN_PATH}
        onClick={onNavigate}
        className={`${buttonClass('secondary', size)} ${width} gap-2`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4"
        >
          <circle cx="10" cy="6.5" r="3.25" />
          <path d="M3.75 17c.9-3.1 3.3-4.75 6.25-4.75S15.35 13.9 16.25 17" strokeLinecap="round" />
        </svg>
        {labels.login}
      </Link>
      {buttons.map((item) => (
        <CmsLink
          key={item.id}
          link={item.link}
          newTabLabel={labels.newTab}
          onClick={onNavigate}
          className={`${buttonClass('primary', size)} ${width}`}
        >
          {item.label}
        </CmsLink>
      ))}
    </>
  )
}

export function NavbarView({ navbar, labels }: { navbar: Navbar | null; labels: NavbarLabels }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const atTop = useSyncExternalStore(subscribeToScroll, atPageTop, () => true)
  const toggle = useRef<HTMLButtonElement>(null)
  const logo = typeof navbar?.logo === 'object' ? navbar.logo : null
  const items = navbar?.items ?? []
  // Text links and dropdowns sit next to the logo; button items join the actions on the right.
  const links = items.filter((item) => item.type === 'dropdown' || item.appearance !== 'button')
  const buttons = items.filter((item) => item.type !== 'dropdown' && item.appearance === 'button')
  const close = () => setOpen(false)
  const shared = { pathname, labels, onNavigate: close }

  useEffect(() => {
    if (!open) return
    // The page under the open menu doesn't scroll. The menu closes when the bar shows the links.
    const root = document.documentElement
    const wide = matchMedia('(min-width: 64rem)')
    const closeOnWide = () => wide.matches && setOpen(false)
    root.style.overflow = 'hidden'
    wide.addEventListener('change', closeOnWide)
    return () => {
      root.style.overflow = ''
      wide.removeEventListener('change', closeOnWide)
    }
  }, [open])

  return (
    <header
      // Over the homepage hero the bar is clear until the page scrolls or the menu opens (globals.css).
      data-site-header=""
      data-clear={atTop && !open ? '' : undefined}
      className="border-border/70 bg-background/80 sticky top-0 z-30 h-(--navbar-height) border-b backdrop-blur-xl backdrop-saturate-150"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          toggle.current?.focus()
        }
      }}
    >
      <a
        href="#main"
        className="bg-surface sr-only rounded-full px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50"
      >
        {labels.skip}
      </a>
      <nav aria-label={labels.label} className="mx-auto h-full max-w-6xl px-4 sm:px-6">
        <div className="flex h-full items-center gap-2 max-[359px]:gap-1">
          <Link
            href="/"
            aria-label={labels.home}
            onClick={close}
            className={`mr-4 flex min-w-0 shrink-0 items-center rounded-lg max-[359px]:mr-0 ${focusRing}`}
          >
            {isPublicMedia(logo) ? (
              <Logo media={logo} className="h-8 w-auto max-w-40 object-contain" />
            ) : (
              <BrandLogo className="h-8 w-auto max-[359px]:h-7" />
            )}
          </Link>
          <ul className="hidden items-center gap-0.5 lg:flex">
            <NavItems items={links} variant="bar" {...shared} />
          </ul>
          <div className="ml-auto flex items-center gap-2 max-[359px]:gap-1.5">
            <LanguageSwitcher label={labels.language} />
            <ThemeToggle label={labels.theme} />
            <div className="hidden items-center gap-2 pl-1 lg:flex">
              <Actions buttons={buttons} variant="bar" {...shared} />
            </div>
            <button
              ref={toggle}
              type="button"
              aria-label={open ? labels.closeMenu : labels.menu}
              aria-expanded={open}
              aria-controls="navbar-menu"
              onClick={() => setOpen(!open)}
              className={`hover:bg-foreground/5 flex size-9 items-center justify-center rounded-full transition-colors lg:hidden ${focusRing}`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d={open ? 'M5 5l10 10' : 'M3 7h14'} />
                <path d={open ? 'M15 5L5 15' : 'M3 13h14'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Phone and tablet menu, over the page. inert keeps it out of tab order and screen readers while closed. */}
        <div
          aria-hidden="true"
          onClick={close}
          className={`absolute inset-x-0 top-full h-dvh bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <div
          id="navbar-menu"
          inert={!open}
          className={`${collapse(open)} border-border bg-background absolute inset-x-0 top-full shadow-xl shadow-black/10 lg:hidden ${
            open ? 'border-b' : ''
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mx-auto max-h-[calc(100dvh-var(--navbar-height))] max-w-6xl overflow-y-auto overscroll-contain px-4 pt-3 pb-6 sm:px-6">
              <ul className="space-y-0.5">
                <NavItems items={links} variant="menu" {...shared} />
              </ul>
              <div className="border-border mt-4 flex flex-col gap-3 border-t pt-5">
                <Actions buttons={buttons} variant="menu" {...shared} />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
