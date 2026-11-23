import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { servicePath } from '@/lib/pages'
import { SITE_NAME } from '@/lib/website/metadata'
import type { WebsitePage } from '@/lib/website/load'
import type { Service } from '@/payload-types'
import { buttonClass, CmsLink } from './cms-link'
import { HeroCurrent } from './hero-current'
import { HeroLandscape } from './hero-landscape'
import { HeroMap } from './hero-map'
import { HeroScene } from './hero-scene'
import styles from './hero.module.css'
import { isPublicMedia, ResponsiveImage } from './media-image'

type HeroProps = Pick<WebsitePage, 'eyebrow' | 'title' | 'subtitle' | 'actions' | 'heroArtwork'> & {
  services: Service[]
}

// Slugs identify the studio's services across both locales. New services get a neutral icon.
const servicePaths: Record<string, string> = {
  'ki-telefon-und-chat-assistenten': 'M4 5h16v12h-9l-5 4v-4H4z M8 11h1m3-3v6m3-4v2',
  'ki-automatisierung':
    'M2 9h6v6H2z M16 2h6v6h-6z M16 16h6v6h-6z M8 12h2a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3 M10 12a3 3 0 0 1 3 3v1a3 3 0 0 0 3 3',
  websites: 'M2 4h20v16H2z M2 9h20 M5 6.5h1m2 0h1',
  'seo-und-ki-suche': 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M15 15l6 6 M7 12l3-4 3 1',
  'software-und-apps': 'm7 6-6 6 6 6m10-12 6 6-6 6m-3-15-4 18',
  web3: 'm12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10 M7.5 4.5l9 5v5',
}

function ServiceIcon({ slug }: { slug: string }) {
  return (
    <svg
      aria-hidden="true"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d={servicePaths[slug] ?? 'm12 2 10 6-10 6L2 8z M2 13l10 6 10-6'} />
    </svg>
  )
}

// Each layout specifies the button center (% of the map) and the border the current meets.
// On phones the buttons are centered: the top three are entered from the left, the bottom three from the right.
const branches = [
  { wide: [27, 20, 'bottom'], phone: [50, 8, 'left'] },
  { wide: [73, 20, 'bottom'], phone: [50, 21, 'left'] },
  { wide: [13, 50, 'right'], phone: [50, 34, 'left'] },
  { wide: [87, 50, 'left'], phone: [50, 66, 'right'] },
  { wide: [27, 80, 'top'], phone: [50, 79, 'right'] },
  { wide: [73, 80, 'top'], phone: [50, 92, 'right'] },
] as const

function ServiceNode({ service, slot }: { service: Service; slot?: number }) {
  const branch = slot === undefined ? undefined : branches[slot]
  const position =
    branch &&
    ({
      '--x': branch.wide[0] + 'cqw',
      '--y': branch.wide[1] + '%',
      '--wide-edge': branch.wide[2],
      '--phone-x': branch.phone[0] + 'cqw',
      '--phone-y': branch.phone[1] + '%',
      '--phone-edge': branch.phone[2],
      '--delay': `${(slot ?? 0) * -1.13}s`,
    } as CSSProperties)
  return (
    <li className={branch ? styles.node : undefined} data-slot={slot} style={position}>
      {branch && <HeroCurrent id={`hero-current-${slot}`} />}
      <Link data-glass-service="" className={styles.service} href={servicePath(service.slug)}>
        <span className={styles.icon}>
          <ServiceIcon slug={service.slug} />
        </span>
        <span>{service.title}</span>
      </Link>
    </li>
  )
}

export async function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  heroArtwork,
  services,
}: HeroProps) {
  const t = await getTranslations()
  const featured = services.slice(0, branches.length)
  const remaining = services.slice(branches.length)
  const customArtwork = isPublicMedia(heroArtwork) ? heroArtwork : null
  return (
    <section data-home-hero="" aria-labelledby="hero-title">
      <HeroScene
        pauseLabel={t('Home.pauseMotion')}
        playLabel={t('Home.playMotion')}
        animateLandscape={!customArtwork}
        landscape={
          customArtwork ? (
            <ResponsiveImage media={customArtwork} priority sizes="100vw" alt="" />
          ) : (
            <HeroLandscape />
          )
        }
      >
        <HeroMap>
          <div className={styles.identity}>
            <h1 id="hero-title">
              <span className={styles.wordmark}>{SITE_NAME}</span>
              {title?.trim() && <span className="sr-only"> — {title}</span>}
            </h1>
            {eyebrow?.trim() && <p className={styles.eyebrow}>{eyebrow}</p>}
            {subtitle?.trim() && <p className="sr-only">{subtitle}</p>}
          </div>
          {featured.length > 0 && (
            <nav className={styles.network} aria-label={t('Services.overview')}>
              <ul>
                {featured.map((service, index) => (
                  <ServiceNode
                    key={service.id}
                    service={service}
                    slot={Math.floor((index * branches.length) / featured.length)}
                  />
                ))}
              </ul>
            </nav>
          )}
        </HeroMap>
        {remaining.length > 0 && (
          <nav className={styles.overflow} aria-label={t('Services.overview')}>
            <ul>
              {remaining.map((service) => (
                <ServiceNode key={service.id} service={service} />
              ))}
            </ul>
          </nav>
        )}
        {actions?.length ? (
          <div className={styles.actions}>
            {actions.map((action) => (
              <CmsLink
                key={action.id}
                link={action.link}
                newTabLabel={t('Navigation.newTab')}
                className={buttonClass(action.appearance, 'compact')}
              >
                {action.label}
              </CmsLink>
            ))}
          </div>
        ) : null}
      </HeroScene>
    </section>
  )
}
