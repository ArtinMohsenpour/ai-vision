import type { Block, BlocksField } from 'payload'

import { columnField } from '@/fields/content'
import { rowLabel } from '@/fields/row-label'

function layout(slug: string, label: string, columns: number, interfaceName: string): Block {
  return {
    slug,
    interfaceName,
    labels: { singular: label, plural: label },
    admin: {
      // Rows show the section title and layout; the separate block name input is not needed.
      disableBlockName: true,
      components: { Label: rowLabel(['title', 'eyebrow'], 'Section', { suffix: label.split(' — ')[0] }) },
    },
    fields: [
      { name: 'eyebrow', type: 'text', maxLength: 100 },
      { name: 'title', label: 'Section title (H2)', type: 'text', maxLength: 160 },
      { name: 'subtitle', type: 'textarea', maxLength: 600 },
      {
        type: 'row',
        fields: [
          {
            name: 'tone',
            label: 'Background',
            type: 'select',
            defaultValue: 'plain',
            options: [
              { label: 'Page background', value: 'plain' },
              { label: 'Surface', value: 'surface' },
              { label: 'Soft accent', value: 'accent' },
            ],
            admin: { width: '50%' },
          },
          {
            name: 'alignment',
            label: 'Column alignment',
            type: 'select',
            defaultValue: 'top',
            options: [
              { label: 'Top', value: 'top' },
              { label: 'Vertically centered', value: 'center' },
            ],
            admin: { width: '50%' },
          },
        ],
      },
      ...Array.from({ length: columns }, (_, index) =>
        columnField(`column${index + 1}`, columns === 1 ? 'Content' : `Column ${index + 1}`),
      ),
    ],
  }
}

/** Registered once in payload.config.ts (`blocks`) and referenced by every page. */
export const sectionLayouts: Block[] = [
  layout('fullWidth', '100% — full width', 1, 'FullWidthSection'),
  layout('twoColumns', '50% / 50% — two columns', 2, 'TwoColumnSection'),
  layout('threeColumns', '33% / 33% / 33% — three columns', 3, 'ThreeColumnSection'),
]

export function sectionsField(): BlocksField {
  return {
    name: 'sections',
    label: 'Page sections',
    type: 'blocks',
    localized: true,
    maxRows: 30,
    blocks: [],
    blockReferences: ['fullWidth', 'twoColumns', 'threeColumns'],
    admin: {
      initCollapsed: true,
      description:
        'Add, reorder and reuse layouts. Columns stack in reading order on mobile. Each language has its own sections; English falls back to German until you add English sections.',
    },
  }
}
