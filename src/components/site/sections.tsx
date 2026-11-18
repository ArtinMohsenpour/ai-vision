import type { WebsiteLocale } from '@/lib/pages'
import type { ContentSection, WebsitePage } from '@/lib/website/load'
import type { ContentItem, Service } from '@/payload-types'
import { buttonClass, CmsLink } from './cms-link'
import { MediaImage } from './media-image'
import { RichText } from './rich-text'
import { selectServices, ServiceCards } from './service-cards'

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
        <ol className={`grid gap-4 ${columns === 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
          {item.cards?.map((card, index) => (
            <li key={card.id ?? index} className="rounded-3xl border border-border bg-surface p-6">
              {item.numbered && (
                <span aria-hidden="true" className="mb-3 flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                  {index + 1}
                </span>
              )}
              <h3 className="font-semibold tracking-tight">{card.title}</h3>
              {card.text && <p className="mt-2 text-sm leading-relaxed text-muted">{card.text}</p>}
            </li>
          ))}
        </ol>
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
