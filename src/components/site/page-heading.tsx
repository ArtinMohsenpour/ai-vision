import type { WebsitePage } from '@/lib/website/load'
import { buttonClass, CmsLink } from './cms-link'

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  actions,
  hero = false,
}: Pick<WebsitePage, 'eyebrow' | 'title' | 'subtitle' | 'actions'> & { hero?: boolean }) {
  if (![eyebrow, title, subtitle].some((value) => value?.trim()) && !actions?.length) return null
  return (
    <header className={`mx-auto max-w-3xl text-center ${hero ? 'py-20 sm:py-28' : 'py-14 sm:py-20'}`}>
      {eyebrow?.trim() && <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>}
      {title?.trim() && (
        <h1 className={`font-semibold tracking-tight text-balance ${hero ? 'text-4xl sm:text-6xl' : 'text-4xl sm:text-5xl'}`}>{title}</h1>
      )}
      {subtitle?.trim() && <p className="mt-5 text-lg leading-relaxed text-pretty text-muted">{subtitle}</p>}
      {actions?.length ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <CmsLink key={action.id} link={action.link} className={buttonClass(action.appearance)}>
              {action.label}
            </CmsLink>
          ))}
        </div>
      ) : null}
    </header>
  )
}
