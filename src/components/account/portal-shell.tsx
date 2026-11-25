import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { signOutCustomer } from '@/lib/customer-auth/actions'
import type { Customer } from '@/payload-types'
import { PortalIcon } from './portal-icons'
import authStyles from './account.module.css'
import styles from './portal.module.css'

export async function PortalShell({
  section,
  user,
  locale,
  children,
}: {
  section: 'profile' | 'security' | 'orders'
  user: Customer
  locale: Locale
  children: ReactNode
}) {
  const t = await getTranslations('CustomerPortal')
  const links = [
    { key: 'profile', href: '/account' },
    { key: 'orders', href: '/account/orders' },
    { key: 'security', href: '/account/security' },
  ] as const
  const initials = `${Array.from(user.firstName)[0] ?? ''}${Array.from(user.lastName)[0] ?? ''}`
  return (
    <div className={`${styles.portal} ${authStyles.formTheme}`}>
      <header className={styles.hero}>
        <div>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </div>
        <span className={styles.verified}>
          <PortalIcon name="verified" />
          {t('verified')}
        </span>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.identity}>
            <span aria-hidden="true" className={styles.avatar}>
              {initials}
            </span>
            <div>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <span title={user.email}>{user.email}</span>
            </div>
          </div>
          <nav className={styles.navigation} aria-label={t('menu')}>
            {links.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                prefetch={false}
                aria-current={section === key ? 'page' : undefined}
              >
                <PortalIcon name={key} />
                <span>{t(key)}</span>
                <PortalIcon name="arrow" />
              </Link>
            ))}
          </nav>
          <form className={styles.logout} action={signOutCustomer.bind(null, locale)}>
            <button type="submit">
              <PortalIcon name="logout" />
              {t('signOut')}
            </button>
          </form>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
