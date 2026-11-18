'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * Array and block rows labelled by their first filled field (e.g. a link label or a section
 * title) instead of "Item 01". `options` maps stored values to readable names (e.g. content types).
 * `suffix` is appended in muted text, e.g. the section layout.
 */
export default function RowLabel({
  fields,
  fallback,
  options,
  suffix,
}: {
  fields: string[]
  fallback: string
  options?: Record<string, string>
  suffix?: string
}) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const value = fields
    .map((field) => data?.[field])
    .find((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return (
    <span>
      {value ? (options?.[value] ?? value) : `${fallback} ${number}`}
      {suffix && <span style={{ opacity: 0.6 }}> · {suffix}</span>}
    </span>
  )
}
