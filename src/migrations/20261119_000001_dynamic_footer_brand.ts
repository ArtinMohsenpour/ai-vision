import type { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const locale of ['de', 'en'] as const) {
    const footer = await payload.findGlobal({
      slug: 'footer', locale, fallbackLocale: false, depth: 0, draft: true, req,
    })
    if (footer._status === 'published' && footer.copyright === '© {year} Rheivo') {
      // An empty notice uses SITE_NAME, including after future brand changes.
      await payload.updateGlobal({
        slug: 'footer', locale, req, data: { copyright: null, _status: 'published' },
      })
    }
  }
}

export async function down(): Promise<void> {
  // The previous editorial value remains available in the footer's version history.
}
