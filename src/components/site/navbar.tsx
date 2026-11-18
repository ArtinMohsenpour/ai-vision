import { getLocale, getTranslations } from 'next-intl/server'

import type { WebsiteLocale } from '@/lib/pages'
import { loadNavbar } from '@/lib/website/load'
import { NavbarView } from './navbar-view'

export async function Navbar() {
  const locale = (await getLocale()) as WebsiteLocale
  const [navbar, t] = await Promise.all([loadNavbar(locale), getTranslations('Navigation')])
  return (
    <NavbarView
      navbar={navbar}
      labels={{
        home: t('home'),
        label: t('label'),
        menu: t('menu'),
        closeMenu: t('closeMenu'),
        skip: t('skip'),
        language: t('language'),
        newTab: t('newTab'),
        login: t('login'),
        theme: t('theme'),
      }}
    />
  )
}
