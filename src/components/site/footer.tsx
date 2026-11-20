import { getLocale, getTranslations } from 'next-intl/server'

import { externalHref } from '@/lib/links'
import type { WebsiteLocale } from '@/lib/pages'
import { socialLabel } from '@/lib/social'
import { loadFooter } from '@/lib/website/load'
import { SITE_NAME } from '@/lib/website/metadata'
import { BrandLogo } from './brand-logo'
import { CmsLink } from './cms-link'
import { isPublicMedia, Logo } from './media-image'
import { SocialIcon } from './social-icon'

const linkClass = 'text-sm text-muted transition-colors hover:text-foreground'

export async function Footer() {
  const locale = (await getLocale()) as WebsiteLocale
  const [{ footer, logo }, t] = await Promise.all([loadFooter(locale), getTranslations('Footer')])
  const year = new Intl.DateTimeFormat('de-DE', { year: 'numeric', timeZone: 'Europe/Berlin' }).format(new Date())
  const copyright = (footer?.copyright?.trim() || `© {year} ${SITE_NAME}`).replaceAll('{year}', year)
  const contact = footer?.contact
  const social = footer?.social?.filter((profile) => externalHref(profile.url)) ?? []

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          {isPublicMedia(logo) ? (
            <Logo media={logo} className="h-9 w-auto max-w-40 object-contain" />
          ) : (
            <BrandLogo className="h-10 w-auto" />
          )}
          {footer?.tagline && <p className="max-w-sm text-sm leading-relaxed text-muted">{footer.tagline}</p>}
          {(contact?.email || contact?.phone || contact?.address) && (
            <address className="space-y-1 text-sm not-italic text-muted">
              {contact.address && <p className="whitespace-pre-line">{contact.address}</p>}
              {contact.email && (
                <p>
                  <span className="sr-only">{t('email')}: </span>
                  <a href={`mailto:${contact.email}`} className="hover:text-foreground">{contact.email}</a>
                </p>
              )}
              {contact.phone && (
                <p>
                  <span className="sr-only">{t('phone')}: </span>
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="hover:text-foreground">{contact.phone}</a>
                </p>
              )}
            </address>
          )}
          {social.length > 0 && (
            <ul aria-label={t('social')} className="flex gap-2">
              {social.map((profile) => (
                <li key={profile.id}>
                  <a
                    href={externalHref(profile.url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-foreground"
                  >
                    <SocialIcon platform={profile.platform} />
                    <span className="sr-only">{socialLabel(profile.platform)} ({t('newTab')})</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {footer?.columns?.length ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-8">
            {footer.columns.map((column) => (
              <nav key={column.id} aria-label={column.title} className="min-w-0 wrap-anywhere">
                <p className="mb-3 text-sm font-semibold">{column.title}</p>
                <ul className="space-y-2">
                  {column.links?.map((item) => (
                    <li key={item.id}>
                      <CmsLink link={item.link} newTabLabel={t('newTab')} className={linkClass}>
                        {item.label}
                      </CmsLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        ) : null}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted">{copyright}</p>
          {footer?.legalLinks?.length ? (
            <nav aria-label={t('legal')}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {footer.legalLinks.map((item) => (
                  <li key={item.id}>
                    <CmsLink link={item.link} newTabLabel={t('newTab')} className={linkClass}>
                      {item.label}
                    </CmsLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
