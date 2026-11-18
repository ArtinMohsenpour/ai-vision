'use client'

import { useRowLabel } from '@payloadcms/ui'

export default function RowLabel({ fields, fallback }: { fields: string[]; fallback: string }) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const value = fields
    .map((field) => data?.[field])
    .find((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <span>{value ?? `${fallback} ${number}`}</span>
}
