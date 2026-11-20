import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { sectionLayouts } from './blocks/layouts'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { Navbar } from './globals/Navbar'
import { PageGlobals } from './globals/pages'
import { emailAdapter } from './lib/customer-auth/email'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    // Only `users` may log into /admin. Customers (collection `customers`) use the website.
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // The order sets the order of the sidebar groups (see ADMIN_GROUPS in src/lib/cms.ts).
  collections: [Services, Media, Customers, Users],
  globals: [...PageGlobals, Navbar, Footer],
  // Section layouts shared by every page (referenced through `blockReferences`).
  blocks: sectionLayouts,
  localization: {
    locales: [
      { code: 'de', label: 'Deutsch' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  editor: lexicalEditor(),
  graphQL: {
    disable: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  email: emailAdapter,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Schema changes go through reviewed migrations only (`pnpm payload migrate:create`).
    push: false,
    // Page sections are bounded editorial documents. Store them as JSONB instead of
    // creating block and column tables for every page global.
    blocksAsJSON: true,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [],
})
