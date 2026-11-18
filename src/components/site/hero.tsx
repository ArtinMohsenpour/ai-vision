import type { WebsitePage } from '@/lib/website/load'
import { buttonClass, CmsLink } from './cms-link'

/**
 * HERO PLACEHOLDER. The final hero is still to be designed. Its texts already come from the
 * Home global's "Hero" tab (eyebrow, title, subtitle, buttons); keep using those fields when the
 * new design replaces this component. The visual on the right is decorative only.
 */
export function Hero({ eyebrow, title, subtitle, actions }: Pick<WebsitePage, 'eyebrow' | 'title' | 'subtitle' | 'actions'>) {
  return (
    <section data-hero="placeholder" aria-labelledby="hero-title" className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        {eyebrow?.trim() && <p className="text-primary mb-4 text-xs font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>}
        <h1 id="hero-title" className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {title}
        </h1>
        {subtitle?.trim() && <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed text-pretty">{subtitle}</p>}
        {actions?.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <CmsLink key={action.id} link={action.link} className={buttonClass(action.appearance)}>
                {action.label}
              </CmsLink>
            ))}
          </div>
        ) : null}
      </div>
      <div aria-hidden="true" className="border-border bg-surface relative hidden aspect-[5/4] overflow-hidden rounded-[2rem] border lg:block">
        <div className="bg-primary/25 absolute -top-16 -left-10 size-72 rounded-full blur-3xl" />
        <div className="bg-accent absolute -right-12 -bottom-20 size-80 rounded-full blur-2xl" />
        <div className="absolute inset-10 grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={`border-border bg-background/70 rounded-2xl border ${index % 4 === 0 ? 'col-span-2' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
