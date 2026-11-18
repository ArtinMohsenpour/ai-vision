import type {
  Field,
  FieldHook,
  SelectFieldSingleValidation,
  TextFieldSingleValidation,
} from 'payload'

import { externalHref } from '@/lib/links'
import { websitePages } from '@/lib/pages'

export const validateExternalURL =
  (required: boolean): TextFieldSingleValidation =>
  (value) =>
    (!required && !value?.trim()) ||
    Boolean(externalHref(value)) ||
    'Enter a full URL beginning with https:// or http://.'

const when =
  (type: 'internal' | 'external') =>
  (_: unknown, sibling: Record<string, unknown> | undefined): boolean =>
    sibling?.type === type

type LinkSibling = { type?: string; service?: unknown }

/** Saves only the destination of the chosen link type, so no stale page or URL stays behind. */
const keepFor =
  (type: 'internal' | 'external'): FieldHook =>
  ({ value, siblingData }) =>
    (siblingData as LinkSibling)?.type === type ? value : null

/**
 * Fields of one link: a page on this website or an external URL. Used inside a `group` field by
 * the navbar, footer, page headings and button items.
 *
 * An internal link stores either `page` (a fixed page from src/lib/pages.ts) or `service` (a
 * service page, so the link follows slug changes). Editors set both through one grouped,
 * color-coded picker (src/components/admin/link-target-field.tsx); `service` itself is hidden.
 */
export const linkFields = (): Field[] => [
  {
    name: 'type',
    label: 'Link to',
    type: 'radio',
    required: true,
    defaultValue: 'internal',
    options: [
      { label: 'Page on this website', value: 'internal' },
      { label: 'External URL', value: 'external' },
    ],
    admin: { layout: 'horizontal' },
  },
  {
    name: 'page',
    label: 'Page',
    type: 'select',
    options: websitePages.map(({ slug, en, path }) => ({ label: `${en} (${path})`, value: slug })),
    validate: ((value, { siblingData }) => {
      const sibling = siblingData as LinkSibling
      return (
        sibling?.type !== 'internal' ||
        Boolean(value) ||
        Boolean(sibling.service) ||
        'Choose a page.'
      )
    }) as SelectFieldSingleValidation,
    hooks: { beforeChange: [keepFor('internal')] },
    admin: {
      condition: when('internal'),
      components: { Field: '/components/admin/link-target-field' },
    },
  },
  {
    name: 'service',
    type: 'relationship',
    relationTo: 'services',
    maxDepth: 1,
    hooks: { beforeChange: [keepFor('internal')] },
    admin: { hidden: true },
  },
  {
    name: 'url',
    label: 'URL',
    type: 'text',
    validate: ((value, args) =>
      (args.siblingData as LinkSibling)?.type !== 'external' ||
      validateExternalURL(true)(value, args)) as TextFieldSingleValidation,
    hooks: { beforeChange: [keepFor('external')] },
    admin: { condition: when('external'), placeholder: 'https://' },
  },
  { name: 'newTab', type: 'checkbox', defaultValue: false, label: 'Open in a new tab' },
]

/** A labelled link group (label is localized; the destination is shared by both languages). */
export const labelledLink = ({
  maxLength = 60,
  extra = [],
}: { maxLength?: number; extra?: Field[] } = {}): Field[] => [
  { name: 'label', type: 'text', required: true, localized: true, maxLength },
  ...extra,
  { name: 'link', type: 'group', label: false, fields: linkFields() },
]
