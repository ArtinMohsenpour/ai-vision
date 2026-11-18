import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { richTextHref } from '@/lib/links'

/** Lexical content with safe links: local paths get the locale prefix; unsafe URLs render as plain text. */
export function RichText({ data, locale, className = 'prose-site' }: { data: unknown; locale: string; className?: string }) {
  const state = data as SerializedEditorState | null | undefined
  if (!state?.root?.children?.length) return null
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const href = richTextHref(node.fields.url, locale)
      if (!href) return <>{children}</>
      return (
        <a href={href} target={node.fields.newTab ? '_blank' : undefined} rel={node.fields.newTab ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    },
    autolink: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const href = richTextHref(node.fields.url, locale)
      return href ? <a href={href}>{children}</a> : <>{children}</>
    },
  })
  return <LexicalRichText data={state} converters={converters} className={className} />
}
