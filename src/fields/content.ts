import type { Field, GroupField } from 'payload'
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { siteIconOptions } from './icons'
import { labelledLink } from './link'
import { rowLabel } from './row-label'

/** H1 comes from the page heading, so rich text offers H2–H4 only. */
export const websiteEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    BlockquoteFeature(),
    LinkFeature({ enabledCollections: [] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

const when = (...types: string[]) => (_: unknown, sibling: Record<string, unknown> | undefined) =>
  types.includes(sibling?.type as string)

const contentTypes = [
  { label: 'Rich text', value: 'text' },
  { label: 'Image', value: 'image' },
  { label: 'Cards', value: 'cards' },
  { label: 'Timeline (steps)', value: 'steps' },
  { label: 'Key facts', value: 'facts' },
  { label: 'FAQ', value: 'faq' },
  { label: 'Package and price', value: 'offer' },
  { label: 'Service cards', value: 'services' },
  { label: 'Buttons', value: 'buttons' },
]

function contentFields(): Field[] {
  return [
    {
      name: 'type',
      label: 'Content type',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: contentTypes,
    },
    // The rich text editor is a custom component; the wrapping row hides it in the editor
    // while the inner condition keeps validation for the active type only.
    {
      type: 'row',
      admin: { condition: when('text') },
      fields: [
        { name: 'text', type: 'richText', editor: websiteEditor, required: true, admin: { condition: when('text') } },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { condition: when('image') },
    },
    {
      name: 'imageFit',
      type: 'select',
      defaultValue: 'natural',
      options: [
        { label: 'Original proportions', value: 'natural' },
        { label: 'Landscape crop (4:3)', value: 'landscape' },
        { label: 'Square crop', value: 'square' },
      ],
      admin: { condition: when('image') },
    },
    {
      name: 'caption',
      type: 'text',
      maxLength: 300,
      admin: { condition: when('image') },
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 9,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: {
        condition: when('cards'),
        description: 'Short highlights such as benefits or process steps.',
        components: { RowLabel: rowLabel(['title'], 'Card') },
      },
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 100 },
        { name: 'text', type: 'textarea', maxLength: 400 },
        {
          name: 'icon',
          type: 'select',
          options: siteIconOptions,
          admin: {
            description: 'Optional. Shown above the title; numbered cards show the number instead.',
          },
        },
      ],
    },
    {
      name: 'numbered',
      label: 'Number the cards (for steps)',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: when('cards') },
    },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 8,
      labels: { singular: 'Step', plural: 'Steps' },
      admin: {
        condition: when('steps'),
        description: 'Process steps in order, shown as a connected timeline.',
        components: { RowLabel: rowLabel(['title'], 'Step') },
      },
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 80 },
        { name: 'text', type: 'textarea', maxLength: 300 },
        {
          name: 'note',
          type: 'text',
          maxLength: 40,
          admin: { description: 'Optional short label next to the step, for example "online".' },
        },
      ],
    },
    {
      name: 'facts',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 4,
      labels: { singular: 'Fact', plural: 'Facts' },
      admin: {
        condition: when('facts'),
        description:
          'A row of short values with a label, for example "DE · EN" and "Two languages". Use real facts only.',
        components: { RowLabel: rowLabel(['value', 'label'], 'Fact') },
      },
      fields: [
        { name: 'value', type: 'text', required: true, maxLength: 24 },
        { name: 'label', type: 'text', required: true, maxLength: 80 },
      ],
    },
    {
      name: 'offerService',
      label: 'Service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      admin: {
        condition: when('offer'),
        description:
          "Shows the live base price, included points, delivery time and extras from this service's Ordering tab, with its order button. While online ordering is closed, a contact button replaces it.",
      },
    },
    {
      name: 'offerLayout',
      label: 'Show',
      type: 'select',
      defaultValue: 'extras',
      options: [
        { label: 'Package with extras', value: 'extras' },
        { label: 'Package only', value: 'package' },
        { label: 'Price and button only', value: 'compact' },
      ],
      admin: { condition: when('offer') },
    },
    {
      name: 'faq',
      label: 'Questions and answers',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 20,
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        condition: when('faq'),
        description: 'Shown as expandable questions and published as FAQ data for search engines.',
        components: { RowLabel: rowLabel(['question'], 'Question') },
      },
      fields: [
        { name: 'question', type: 'text', required: true, maxLength: 200 },
        { name: 'answer', type: 'richText', editor: websiteEditor, required: true },
      ],
    },
    {
      name: 'services',
      label: 'Service pages',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        condition: when('services'),
        description: 'Choose and drag to order. Leave empty to show all published services in their sort order.',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      labels: { singular: 'Button', plural: 'Buttons' },
      admin: {
        condition: when('buttons'),
        components: { RowLabel: rowLabel(['label'], 'Button') },
      },
      fields: labelledLink({
        maxLength: 40,
        extra: [
          {
            name: 'appearance',
            type: 'select',
            defaultValue: 'primary',
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
            ],
          },
        ],
      }),
    },
  ]
}

export function columnField(name: string, label: string): GroupField {
  return {
    name,
    label,
    type: 'group',
    fields: [
      {
        name: 'content',
        type: 'array',
        label: 'Content items',
        interfaceName: 'ContentItem',
        maxRows: 12,
        labels: { singular: 'Content item', plural: 'Content items' },
        admin: {
          initCollapsed: true,
          components: {
            RowLabel: rowLabel(['type'], 'Content item', {
              options: Object.fromEntries(contentTypes.map(({ value, label }) => [value, label])),
            }),
          },
        },
        fields: contentFields(),
      },
    ],
  }
}
