import { getTranslations } from 'next-intl/server'
import type { CSSProperties } from 'react'

import type { Service } from '@/payload-types'
import { HeroCurrent } from './hero-current'
import { HeroLandscape } from './hero-landscape'
import { HeroMap } from './hero-map'
import { HeroScene } from './hero-scene'
import styles from './hero.module.css'

export async function ServiceHero({
  title,
  heroFeatures,
}: Pick<Service, 'title' | 'heroFeatures'>) {
  const t = await getTranslations()
  const features = (heroFeatures ?? []).filter((feature) => feature.label?.trim())
  const rows = Math.ceil(features.length / 2)
  const phoneRows = Math.ceil(features.length / 4)
  const bottomOffset = (features.length - rows) % 2
  const mapStyle = {
    '--feature-rows': Math.max(1, rows),
    '--phone-feature-rows': phoneRows,
  } as CSSProperties

  return (
    <section data-service-hero="" aria-labelledby="service-hero-title">
      <HeroScene
        landscape={<HeroLandscape />}
        animateLandscape={false}
        animateConnections={features.length > 0}
        pauseLabel={t('Home.pauseMotion')}
        playLabel={t('Home.playMotion')}
      >
        <HeroMap variant="service" style={mapStyle}>
          <div className={`${styles.identity} ${styles.serviceIdentity}`}>
            <h1 id="service-hero-title" className={`${styles.wordmark} ${styles.serviceTitle}`}>
              {title}
            </h1>
          </div>
          {features.length > 0 && (
            <ul className={styles.featureList} role="list" aria-label={t('Services.heroFeatures')}>
              {features.map(({ id, label }, index) => {
                const left = index % 2 === 0
                const above = index < rows
                const phoneIndex = above ? index : index - rows + bottomOffset
                const phoneLeft = phoneIndex % 2 === 0
                const position = {
                  '--row': Math.floor(index / 2) + 1,
                  '--column': left ? 1 : 3,
                  '--wide-edge': left ? 'right' : 'left',
                  '--phone-row': Math.floor(phoneIndex / 2) + (above ? 1 : phoneRows + 2),
                  '--phone-column': phoneLeft ? 1 : 2,
                  '--phone-edge': phoneLeft ? 'right' : 'left',
                  '--phone-align': phoneLeft ? 'end' : 'start',
                  '--delay': `${index * -1.13}s`,
                } as CSSProperties

                return (
                  <li
                    key={id ?? index}
                    className={`${styles.node} ${styles.featureNode}`}
                    data-slot={index}
                    style={position}
                  >
                    <HeroCurrent id={`service-current-${index}`} />
                    <span data-glass-service="" className={`${styles.service} ${styles.feature}`}>
                      {label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </HeroMap>
      </HeroScene>
    </section>
  )
}
