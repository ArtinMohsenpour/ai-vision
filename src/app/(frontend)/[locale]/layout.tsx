import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import { Footer } from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { routing } from '@/i18n/routing'
import '../globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Pages are rendered on their first visit and then served from the cache (ISR) until content is
 * published (src/hooks/revalidate.ts) or a day has passed. Nothing is prerendered at build time,
 * so `next build` needs no database.
 */
export function generateStaticParams() {
  return []
}

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return { title: t('title'), description: t('description') }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <Navbar />
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
