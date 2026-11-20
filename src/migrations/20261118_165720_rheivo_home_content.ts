import type { MigrateUpArgs } from '@payloadcms/db-postgres'

// Only update the original published starter content. Each write keeps a restorable Payload version.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const locale of ['de', 'en'] as const) {
    const read = { locale, fallbackLocale: false, depth: 0, draft: true, req } as const
    const home = await payload.findGlobal({ ...read, slug: 'home' })
    const first = home.sections?.[0]
    const items = first?.column1?.content
    const starterTitle = locale === 'de' ? 'Was wir für Sie tun' : 'What we do for you'
    if (
      home._status === 'published' && first?.blockType === 'fullWidth' &&
      first.title === starterTitle && !first.subtitle && items?.length === 1 &&
      items[0].type === 'services' && !items[0].services?.length
    ) {
      await payload.updateGlobal({
        slug: 'home', locale, req,
        data: { sections: home.sections!.slice(1), _status: 'published' },
      })
    }
    const footer = await payload.findGlobal({ ...read, slug: 'footer' })
    if (footer._status === 'published' && footer.copyright === '© {year} AI Vision') {
      await payload.updateGlobal({
        slug: 'footer', locale, req,
        data: { copyright: '© {year} Rheivo', _status: 'published' },
      })
    }
  }
}

export async function down(): Promise<void> {
  // Editorial revisions are restored in Payload's version history so later edits survive rollbacks.
}
