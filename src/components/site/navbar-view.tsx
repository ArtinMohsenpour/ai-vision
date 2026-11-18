'use client'

import { useEffect, useRef, useState } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { resolveLink, type StoredLink } from '@/lib/links'
import { SITE_NAME } from '@/lib/website/metadata'
import type { Navbar } from '@/payload-types'
import { buttonClass, CmsLink } from './cms-link'
import { LanguageSwitcher } from './language-switcher'
import { isPublicMedia, Logo } from './media-image'

type Labels = Record<'home' | 'label' | 'menu' | 'closeMenu' | 'skip' | 'language' | 'newTab', string>
type Item = NonNullable<Navbar['items']>[number]

const normalize = (path: string) => path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'

function isActive(link: StoredLink | null | undefined, pathname: string) {
  const resolved = resolveLink(link)
  return Boolean(resolved && !resolved.external && normalize(resolved.href) === normalize(pathname))
}

const textLinkClass = (active: boolean) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${
    active ? 'text-primary' : 'text-foreground hover:text-primary'
  }`

function Dropdown({ item, pathname, labels, onNavigate }: { item: Item; pathname: string; labels: Labels; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLLIElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const active = item.children?.some((child) => isActive(child.link, pathname)) ?? false

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  return (
    <li
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
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
        aria-controls={`nav-${item.id}`}
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-1.5 ${textLinkClass(active)}`}
      >
        {item.label}
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-3.5 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          id={`nav-${item.id}`}
          className="mt-1 space-y-0.5 rounded-2xl border border-border bg-surface p-2 shadow-lg lg:absolute lg:top-full lg:left-0 lg:z-40 lg:mt-2 lg:w-72"
        >
          {item.children?.map((child) => {
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
                  className={`block rounded-xl px-3 py-2 transition-colors hover:bg-accent motion-reduce:transition-none ${childActive ? 'text-primary' : ''}`}
                >
                  <span className="block text-sm font-medium">{child.label}</span>
                  {child.description && <span className="mt-0.5 block text-xs text-muted">{child.description}</span>}
                </CmsLink>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export function NavbarView({ navbar, labels }: { navbar: Navbar | null; labels: Labels }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const logo = typeof navbar?.logo === 'object' ? navbar.logo : null
  const close = () => setOpen(false)

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-lg"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          toggle.current?.focus()
        }
      }}
    >
      <a
        href="#main"
        className="sr-only rounded-full bg-surface px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50"
      >
        {labels.skip}
      </a>
      <nav aria-label={labels.label} className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label={labels.home} onClick={close} className="flex min-w-0 items-center rounded-lg">
          {isPublicMedia(logo) ? (
            <Logo media={logo} className="h-9 w-auto max-w-40 object-contain" />
          ) : (
            <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
          )}
        </Link>
        <button
          ref={toggle}
          type="button"
          aria-label={open ? labels.closeMenu : labels.menu}
          aria-expanded={open}
          aria-controls="navbar-panel"
          onClick={() => setOpen(!open)}
          className="flex size-10 items-center justify-center rounded-full border border-border lg:hidden"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
        <div
          id="navbar-panel"
          className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-4 pt-4 pb-2 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:p-0`}
        >
          <ul className="flex flex-col gap-1 border-t border-border pt-3 lg:flex-row lg:items-center lg:border-0 lg:pt-0">
            {navbar?.items?.map((item) =>
              item.type === 'dropdown' ? (
                <Dropdown key={item.id} item={item} pathname={pathname} labels={labels} onNavigate={close} />
              ) : (
                <li key={item.id} className={item.appearance === 'button' ? 'pt-2 lg:pt-0 lg:pl-2' : undefined}>
                  <CmsLink
                    link={item.link}
                    newTabLabel={labels.newTab}
                    onClick={close}
                    aria-current={isActive(item.link, pathname) ? 'page' : undefined}
                    className={item.appearance === 'button' ? buttonClass('primary') : textLinkClass(isActive(item.link, pathname))}
                  >
                    {item.label}
                  </CmsLink>
                </li>
              ),
            )}
          </ul>
          <div className="border-t border-border pt-3 lg:border-0 lg:pt-0">
            <LanguageSwitcher label={labels.language} />
          </div>
        </div>
      </nav>
    </header>
  )
}
