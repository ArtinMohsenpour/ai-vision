'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './hero.module.css'

function LandscapeVideo({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current!
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const phone = matchMedia('(max-width: 639px)')

    function updatePlayback() {
      if (paused || reducedMotion.matches) {
        video.pause()
        return
      }

      const source = phone.matches ? '/hero/rhine-rain-phone.mp4' : '/hero/rhine-rain-wide.mp4'
      if (video.getAttribute('src') !== source) {
        video.removeAttribute('data-ready')
        video.src = source
      }
      // The still image covers the landscape until playback begins.
      void video.play().catch(() => {})
    }

    updatePlayback()
    reducedMotion.addEventListener('change', updatePlayback)
    phone.addEventListener('change', updatePlayback)
    return () => {
      reducedMotion.removeEventListener('change', updatePlayback)
      phone.removeEventListener('change', updatePlayback)
      video.pause()
    }
  }, [paused])

  return (
    <video
      ref={ref}
      className={styles.weather}
      muted
      loop
      playsInline
      preload="none"
      onPlaying={(event) => {
        event.currentTarget.dataset.ready = ''
      }}
      onError={(event) => event.currentTarget.removeAttribute('data-ready')}
    />
  )
}

export function HeroScene({
  children,
  landscape,
  animateLandscape,
  animateConnections = true,
  pauseLabel,
  playLabel,
}: {
  children: ReactNode
  landscape: ReactNode
  animateLandscape: boolean
  animateConnections?: boolean
  pauseLabel: string
  playLabel: string
}) {
  const [paused, setPaused] = useState(false)
  return (
    <div className={styles.stage} data-paused={paused}>
      <div className={styles.landscape} aria-hidden="true">
        {landscape}
        {animateLandscape && <LandscapeVideo paused={paused} />}
      </div>
      {children}
      {(animateConnections || animateLandscape) && (
        <button
          type="button"
          className={styles.motion}
          aria-label={paused ? playLabel : pauseLabel}
          title={paused ? playLabel : pauseLabel}
          onClick={() => setPaused(!paused)}
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d={paused ? 'M7 4v16l13-8z' : 'M6 4h4v16H6zm8 0h4v16h-4z'} />
          </svg>
        </button>
      )}
    </div>
  )
}
