import type { WebsiteLocale } from '@/lib/pages'
import type { ContentSection, WebsitePage } from '@/lib/website/load'
import type { ContentItem, Service } from '@/payload-types'
import { isSiteIcon } from '@/fields/icons'
import { buttonClass, CmsLink } from './cms-link'
import { MediaImage } from './media-image'
import { Offer } from './offer'
import { RichText } from './rich-text'
import { selectServices, ServiceCards } from './service-cards'
import { SiteIcon } from './site-icon'

type Steps = NonNullable<NonNullable<ContentItem>[number]['steps']>
type Facts = NonNullable<NonNullable<ContentItem>[number]['facts']>

// Static class names, so Tailwind generates them: one timeline column per step on large screens.
const timelineColumns: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}

/**
 * Process steps joined by a line: vertical on phones and in narrow columns, horizontal on large
 * screens in a full-width section (up to six steps).
 */
function Timeline({ steps, horizontal }: { steps: Steps; horizontal: boolean }) {
  const across = horizontal ? timelineColumns[steps.length] : undefined
  return (
    <ol data-timeline="" className={across ? `grid lg:gap-6 ${across}` : 'grid'}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <li
            key={step.id ?? index}
            className={`relative flex gap-4 pb-8 last:pb-0 ${across ? 'lg:flex-col lg:pb-0' : ''}`}
          >
            {!last && (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute top-11 bottom-1 left-5 w-px -translate-x-1/2 bg-linear-to-b from-primary/60 to-border ${across ? 'lg:hidden' : ''}`}
                />
                {across && (
                  <span
                    aria-hidden="true"
                    className="absolute top-5 -right-3 left-13 hidden h-px bg-linear-to-r from-primary/60 to-border lg:block"
                  />
                )}
              </>
            )}
            <span
              aria-hidden="true"
              className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-accent text-sm font-semibold text-primary tabular-nums"
            >
              {index + 1}
            </span>
            <div className={`min-w-0 pt-2 ${across ? 'lg:pt-0' : ''}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-semibold tracking-tight">{step.title}</h3>
                {step.note && (
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                    {step.note}
                  </span>
                )}
              </div>
              {step.text && <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted">{step.text}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// Four or eight cards fill rows of four on large screens instead of leaving one card alone.
const cardColumns = (count: number) =>
  count > 0 && count % 4 === 0 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'

/** A row of short facts (value above its label) with hairline dividers. */
function Facts({ facts, narrow }: { facts: Facts; narrow: boolean }) {
  const grid =
    facts.length === 3
      ? narrow
        ? 'grid-cols-1'
        : 'grid-cols-1 sm:grid-cols-3'
      : facts.length === 4 && !narrow
        ? 'grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-2'
  return (
    <dl data-facts="" className={`grid gap-px overflow-hidden rounded-3xl border border-border bg-border ${grid}`}>
      {facts.map((fact, index) => (
        <div key={fact.id ?? index} className="flex flex-col-reverse justify-end gap-1 bg-surface p-5 sm:p-6">
          <dt className="text-sm leading-snug text-muted">{fact.label}</dt>
          <dd className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function sectionColumns(section: ContentSection) {
  return [
    section.column1,
    ...('column2' in section ? [section.column2] : []),
    ...('column3' in section ? [section.column3] : []),
  ]
}

function Item({ item, locale, columns, services }: { item: NonNullable<ContentItem>[number]; locale: WebsiteLocale; columns: number; services: Service[] }) {
  switch (item.type) {
    case 'text':
      return <RichText data={item.text} locale={locale} />
    case 'image':
      return <MediaImage media={item.image} fit={item.imageFit} caption={item.caption} sizes={columns > 1 ? `(min-width: 1024px) ${Math.round(100 / columns)}vw, 100vw` : '100vw'} />
    case 'cards':
      return (
        <ol className={`grid gap-4 ${columns === 1 ? cardColumns(item.cards?.length ?? 0) : ''}`}>
          {item.cards?.map((card, index) => (
            <li key={card.id ?? index} className="rounded-3xl border border-border bg-surface p-6">
              {item.numbered ? (
                <span aria-hidden="true" className="mb-3 flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                  {index + 1}
                </span>
              ) : (
                isSiteIcon(card.icon) && (
                  <span className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-primary/25 bg-accent text-primary">
                    <SiteIcon name={card.icon} size={22} />
                  </span>
                )
              )}
              <h3 className="font-semibold tracking-tight">{card.title}</h3>
              {card.text && <p className="mt-2 text-sm leading-relaxed text-muted">{card.text}</p>}
            </li>
          ))}
        </ol>
      )
    case 'steps':
      return <Timeline steps={item.steps ?? []} horizontal={columns === 1} />
    case 'facts':
      return <Facts facts={item.facts ?? []} narrow={columns > 1} />
    case 'offer':
      return (
        <Offer
          service={item.offerService}
          layout={item.offerLayout ?? 'extras'}
          locale={locale}
          wide={columns === 1}
        />
      )
    case 'faq':
      return (
        <div className="divide-y divide-border rounded-3xl border border-border bg-surface">
          {item.faq?.map((entry, index) => (
            <details key={entry.id ?? index} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {entry.question}
                <span aria-hidden="true" className="text-xl leading-none text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pt-3">
                <RichText data={entry.answer} locale={locale} />
              </div>
            </details>
          ))}
        </div>
      )
    case 'services':
      return <ServiceCards services={selectServices(item.services, services)} />
    case 'buttons':
      return (
        <div className="flex flex-wrap gap-3">
          {item.buttons?.map((button) => (
            <CmsLink key={button.id} link={button.link} className={buttonClass(button.appearance)}>
              {button.label}
            </CmsLink>
          ))}
        </div>
      )
    default:
      return null
  }
}

const tones = {
  plain: 'py-8 sm:py-12',
  surface: 'rounded-[2rem] border border-border bg-surface p-6 sm:p-10',
  accent: 'rounded-[2rem] bg-accent p-6 sm:p-10',
} as const

export function Sections({ sections, locale, services = [] }: { sections: WebsitePage['sections']; locale: WebsiteLocale; services?: Service[] }) {
  if (!sections?.length) return null
  return (
    <div className="space-y-8 pb-8 sm:space-y-12">
      {sections.map((section, index) => {
        const columns = sectionColumns(section)
        const id = `section-${index + 1}`
        const hasHeading = section.eyebrow?.trim() || section.title?.trim() || section.subtitle?.trim()
        return (
          <section
            key={section.id ?? index}
            aria-labelledby={section.title?.trim() ? `${id}-title` : undefined}
            className={tones[section.tone ?? 'plain']}
          >
            {hasHeading && (
              <div className="mb-8 max-w-2xl">
                {section.eyebrow?.trim() && <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-primary uppercase">{section.eyebrow}</p>}
                {section.title?.trim() && (
                  <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                    {section.title}
                  </h2>
                )}
                {section.subtitle?.trim() && <p className="mt-4 leading-relaxed text-pretty text-muted">{section.subtitle}</p>}
              </div>
            )}
            <div
              className={`grid gap-8 ${columns.length === 2 ? 'md:grid-cols-2' : columns.length === 3 ? 'lg:grid-cols-3' : ''} ${section.alignment === 'center' ? 'items-center' : 'items-start'}`}
            >
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="min-w-0 space-y-6">
                  {column?.content?.map((item, itemIndex) => (
                    <Item key={item.id ?? itemIndex} item={item} locale={locale} columns={columns.length} services={services} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
