import type { Field, TextFieldSingleValidation } from 'payload'

import { externalHref, internalHref } from '@/lib/links'
import { websitePages } from '@/lib/pages'

export const validateExternalURL =
  (required: boolean): TextFieldSingleValidation =>
  (value) =>
    (!required && !value?.trim()) ||
    Boolean(externalHref(value)) ||
    'Enter a full URL beginning with https:// or http://.'

const when =
  (type: string) =>
  (_: unknown, sibling: Record<string, unknown> | undefined): boolean =>
    sibling?.type === type

const requiredFor =
  (type: string, message: string) =>
  (value: unknown, { siblingData }: { siblingData: unknown }) =>
    (siblingData as { type?: string })?.type !== type || Boolean(value) || message

/**
 * Fields of one link: a website page, a service page, another local path or an external URL.
 * Used inside a `group` field by the navbar, footer, page headings and button items.
 */
export const linkFields = (): Field[] => [
  {
    name: 'type',
    label: 'Link to',
    type: 'radio',
    required: true,
    defaultValue: 'page',
    options: [
      { label: 'Website page', value: 'page' },
      { label: 'Service page', value: 'service' },
      { label: 'Other path', value: 'path' },
      { label: 'External URL', value: 'external' },
    ],
    admin: { layout: 'horizontal' },
  },
  {
    name: 'page',
    type: 'select',
    options: websitePages.map(({ slug, en, path }) => ({ label: `${en} (${path})`, value: slug })),
    validate: requiredFor('page', 'Choose a page.'),
    admin: { condition: when('page') },
  },
  {
    name: 'service',
    type: 'relationship',
    relationTo: 'services',
    maxDepth: 1,
    validate: requiredFor('service', 'Choose a service page.'),
    admin: { condition: when('service') },
  },
  {
    name: 'path',
    type: 'text',
    validate: ((value, { siblingData }) =>
      (siblingData as { type?: string })?.type !== 'path' ||
      Boolean(internalHref(value)) ||
      'Enter a local path such as /contact or /#faq, without /de or /en.') as TextFieldSingleValidation,
    admin: {
      condition: when('path'),
      description:
        'For anchors or pages not in the list, e.g. /contact#form. Do not include /de or /en; the language is added automatically.',
    },
  },
  {
    name: 'url',
    label: 'URL',
    type: 'text',
    validate: ((value, args) =>
      (args.siblingData as { type?: string })?.type !== 'external' ||
      validateExternalURL(true)(value, args)) as TextFieldSingleValidation,
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
