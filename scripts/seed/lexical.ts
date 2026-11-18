/**
 * Minimal Markdown-like text → Lexical JSON for seeded content.
 * Blocks are separated by blank lines: `## ` heading (also `### `), lines starting with `- ` form a
 * bullet list, anything else is a paragraph. `**bold**` is supported inside text.
 */
const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

function inline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => {
      const bold = part.startsWith('**') && part.endsWith('**')
      return {
        type: 'text',
        version: 1,
        text: bold ? part.slice(2, -2) : part,
        format: bold ? 1 : 0,
        detail: 0,
        mode: 'normal',
        style: '',
      }
    })
}

function block(source: string) {
  const heading = source.match(/^(#{2,4}) (.*)$/)
  if (heading) {
    return { ...base, type: 'heading', tag: `h${heading[1].length}`, children: inline(heading[2]) }
  }
  const lines = source.split('\n')
  if (lines.every((line) => line.startsWith('- '))) {
    return {
      ...base,
      type: 'list',
      listType: 'bullet',
      tag: 'ul',
      start: 1,
      children: lines.map((line, index) => ({
        ...base,
        type: 'listitem',
        value: index + 1,
        children: inline(line.slice(2)),
      })),
    }
  }
  return { ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: inline(lines.join(' ')) }
}

export function richText(source: string) {
  return {
    root: {
      ...base,
      type: 'root',
      children: source
        .trim()
        .split(/\n\s*\n/)
        .map((part) => block(part.trim())),
    },
  }
}
