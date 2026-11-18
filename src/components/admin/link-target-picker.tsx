'use client'

import { FieldError, FieldLabel, ReactSelect, useField, WatchCondition } from '@payloadcms/ui'

export type TargetGroup = { label: string; options: { label: string; value: string }[] }

/**
 * Writes the chosen target into the link's `page` field (fixed pages) or its hidden `service`
 * field (service pages); the other one is cleared. Colors per group: src/app/(payload)/custom.scss.
 */
export function LinkTargetPicker({
  path,
  label,
  groups,
  readOnly,
}: {
  path: string
  label: string
  groups: TargetGroup[]
  readOnly?: boolean
}) {
  const page = useField<string | null>({ path })
  const service = useField<number | { id: number } | null>({
    path: path.replace(/page$/, 'service'),
  })
  const serviceID =
    service.value && typeof service.value === 'object' ? service.value.id : service.value
  const current = page.value ? `page:${page.value}` : serviceID ? `service:${serviceID}` : null
  const selected = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === current)
  const kind = current?.split(':')[0]

  return (
    // Custom field components must apply the field's condition themselves (shown only for internal links).
    <WatchCondition path={path}>
      <div
        className={[
          'field-type',
          'link-target',
          kind && `link-target--${kind}`,
          page.showError && 'error',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <FieldLabel label={label} path={path} required />
        <div className="field-type__wrap">
          <FieldError path={path} showError={page.showError} message={page.errorMessage} />
          <ReactSelect
            options={groups}
            value={selected}
            disabled={readOnly || page.disabled}
            isClearable={false}
            showError={page.showError}
            placeholder="Choose a page"
            onChange={(option) => {
              if (Array.isArray(option)) return
              const [type, id] = String(option.value).split(':')
              page.setValue(type === 'page' ? id : null)
              service.setValue(type === 'service' ? Number(id) : null)
            }}
          />
        </div>
      </div>
    </WatchCondition>
  )
}
