import type { SelectFieldServerComponent } from 'payload'

import { websitePages } from '@/lib/pages'
import { LinkTargetPicker, type TargetGroup } from './link-target-picker'

type ServiceTarget = {
  id: number
  title?: string | null
  slug?: string | null
  _status?: string | null
}

/**
 * Admin field for an internal link (src/fields/link.ts): one picker with every website page and
 * every service page, grouped and color-coded. Services are read once per form render.
 */
const LinkTargetField: SelectFieldServerComponent = async ({
  clientField,
  path,
  payload,
  req,
  readOnly,
}) => {
  const context = req.context as { linkTargetServices?: Promise<ServiceTarget[]> }
  context.linkTargetServices ??= payload
    .find({
      collection: 'services',
      depth: 0,
      draft: true,
      locale: req.locale ?? 'de',
      pagination: false,
      select: { title: true, slug: true, _status: true },
      sort: 'title',
      req,
    })
    .then(({ docs }) => docs as ServiceTarget[])
  const services = await context.linkTargetServices

  const groups: TargetGroup[] = [
    {
      label: 'Website pages',
      options: websitePages.map(({ slug, en, path: url }) => ({
        label: `${en} · ${url}`,
        value: `page:${slug}`,
      })),
    },
    {
      label: 'Service pages',
      options: services.map(({ id, title, slug, _status }) => ({
        label: `${title || slug} · /services/${slug}${_status === 'published' ? '' : ' (draft)'}`,
        value: `service:${id}`,
      })),
    },
  ]

  return (
    <LinkTargetPicker
      path={path}
      label={typeof clientField.label === 'string' ? clientField.label : 'Page'}
      groups={groups}
      readOnly={readOnly}
    />
  )
}

export default LinkTargetField
