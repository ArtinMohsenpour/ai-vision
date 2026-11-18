import type { TextField } from 'payload'

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isSlug = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 80 && SLUG_PATTERN.test(value)

export const slugField = (description: string): TextField => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  maxLength: 80,
  validate: (value: unknown) =>
    isSlug(value) || 'Use lowercase letters (a–z), numbers and single hyphens, e.g. ki-automatisierung.',
  admin: { position: 'sidebar', description },
})
