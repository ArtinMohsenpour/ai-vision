import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const outbox = process.env.RHEINO_LOCAL_MAIL_DIR || join(process.cwd(), '.next', 'customer-mail')

/** The newest link to `path` in an email sent to `address` (Mailpit or the local outbox). */
export async function linkFromMail(address: string, path: string) {
  const extractLink = (html?: string) => {
    const href = html?.match(/href="([^"]+)"/)?.[1]
    return href && new URL(href).pathname === path ? href : ''
  }
  if (process.env.RHEINO_MAILPIT === '1') {
    const inbox = new URL('http://127.0.0.1:8025/view/latest.html')
    inbox.searchParams.set('query', `to:${address}`)
    const response = await fetch(inbox)
    return response.ok ? extractLink(await response.text()) : ''
  }
  const files = await readdir(outbox).catch(() => [])
  for (const file of files.sort().reverse()) {
    if (!file.endsWith('.json')) continue
    const mail = JSON.parse(await readFile(join(outbox, file), 'utf8')) as {
      to?: string
      html?: string
    }
    if (mail.to !== address) continue
    const href = extractLink(mail.html)
    if (href) return href
  }
  return ''
}
