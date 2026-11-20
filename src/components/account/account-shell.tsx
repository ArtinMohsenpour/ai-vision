import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { BrandLogo } from '@/components/site/brand-logo'
import styles from './account.module.css'

export async function AccountShell({ children }: { children: ReactNode }) {
  const t = await getTranslations('CustomerAuth')
  return (
    <section className={styles.shell}>
      <aside className={styles.landscape}>
        <BrandLogo className={styles.brand} />
        <div className={styles.panelCopy}>
          <span className={styles.location}>{t('panelLabel')}</span>
          <p className={styles.panelTitle}>{t('panelTitle')}</p>
        </div>
      </aside>
      <div className={styles.content}>{children}</div>
    </section>
  )
}
