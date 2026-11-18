import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { WebsitePage } from './load'

/** schema.org FAQPage data from every FAQ item on a page, or null when there are none. */
export function faqJsonLd(sections: WebsitePage['sections']) {
  const entries =
    sections?.flatMap((section) =>
      [section.column1, 'column2' in section ? section.column2 : null, 'column3' in section ? section.column3 : null].flatMap(
        (column) => column?.content?.flatMap((item) => (item.type === 'faq' ? (item.faq ?? []) : [])) ?? [],
      ),
    ) ?? []
  if (!entries.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: convertLexicalToPlaintext({ data: entry.answer as unknown as SerializedEditorState }),
      },
    })),
  }
}
