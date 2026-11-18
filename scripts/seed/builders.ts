import { richText } from './lexical'

type Link =
  | { type: 'page'; page: string }
  | { type: 'service'; service: number }
  | { type: 'path'; path: string }
  | { type: 'external'; url: string }

export const page = (slug: string): Link => ({ type: 'page', page: slug })
export const service = (id: number): Link => ({ type: 'service', service: id })

type Item = Record<string, unknown> & { type: string }
type SectionHeading = {
  eyebrow?: string
  title?: string
  subtitle?: string
  tone?: 'plain' | 'surface' | 'accent'
  alignment?: 'top' | 'center'
}

export const text = (source: string): Item => ({ type: 'text', text: richText(source) })

export const cards = (entries: [string, string][], numbered = false): Item => ({
  type: 'cards',
  numbered,
  cards: entries.map(([title, body]) => ({ title, text: body })),
})

export const faq = (entries: [string, string][]): Item => ({
  type: 'faq',
  faq: entries.map(([question, answer]) => ({ question, answer: richText(answer) })),
})

export const serviceCards = (): Item => ({ type: 'services', services: [] })

export const buttons = (entries: [string, Link, ('primary' | 'secondary')?][]): Item => ({
  type: 'buttons',
  buttons: entries.map(([label, link, appearance = 'primary']) => ({
    label,
    appearance,
    link: { ...link, newTab: false },
  })),
})

export const fullWidth = (heading: SectionHeading, content: Item[]) => ({
  blockType: 'fullWidth',
  tone: 'plain',
  alignment: 'top',
  ...heading,
  column1: { content },
})

export const twoColumns = (heading: SectionHeading, left: Item[], right: Item[]) => ({
  blockType: 'twoColumns',
  tone: 'plain',
  alignment: 'top',
  ...heading,
  column1: { content: left },
  column2: { content: right },
})

export const action = (label: string, link: Link, appearance: 'primary' | 'secondary' = 'primary') => ({
  label,
  appearance,
  link: { ...link, newTab: false },
})

export const navLink = (label: string, link: Link) => ({ label, link: { ...link, newTab: false } })
