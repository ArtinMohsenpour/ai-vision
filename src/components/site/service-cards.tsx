import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { servicePath } from '@/lib/pages'
import type { Service } from '@/payload-types'

export async function ServiceCards({ services }: { services: Service[] }) {
  if (!services.length) return null
  const t = await getTranslations('Services')
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li key={service.id}>
          <Link
            href={servicePath(service.slug)}
            className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-primary"
          >
            <h3 className="text-lg font-semibold tracking-tight">{service.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{service.summary}</p>
            <span className="mt-5 text-sm font-semibold text-primary">
              {t('readMore')} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** The selected services in the chosen order, or all published services when none are selected. */
export function selectServices(selected: (number | Service)[] | null | undefined, all: Service[]) {
  if (!selected?.length) return all
  const ids = selected.map((entry) => (typeof entry === 'object' ? entry.id : entry))
  return ids.map((id) => all.find((service) => service.id === id)).filter((service): service is Service => Boolean(service))
}
