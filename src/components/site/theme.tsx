'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'

/**
 * Light and dark theme. The visitor's choice is saved in localStorage; without a choice the
 * system setting is used and followed. Colors are tokens in src/app/(frontend)/globals.css.
 */
type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const preferredTheme = (): Theme =>
  savedTheme() ?? (matchMedia(DARK_QUERY).matches ? 'dark' : 'light')
const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

/**
 * Sets data-theme on <html> while the HTML is parsed, before the first paint, so cached pages never
 * flash the wrong theme. Same logic as preferredTheme(). On the client the script is inert
 * (text/plain): React doesn't run scripts it renders, and that avoids its dev warning.
 */
export function ThemeScript() {
  const script = `try{var t=localStorage.getItem('${STORAGE_KEY}');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('${DARK_QUERY}').matches?'dark':'light'}catch(e){}`
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}

export function ThemeToggle({ label }: { label: string }) {
  // null while hydrating: the server can't know the theme, so aria-pressed is set after hydration.
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null)

  useLayoutEffect(() => {
    // React resets <html> attributes when the root layout remounts (dev Strict Mode, language switch).
    applyTheme(preferredTheme())
    const media = matchMedia(DARK_QUERY)
    const followSystem = () => {
      if (!savedTheme()) applyTheme(preferredTheme())
    }
    media.addEventListener('change', followSystem)
    return () => media.removeEventListener('change', followSystem)
  }, [])

  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode: the theme still changes for this page view.
    }
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => applyTheme(next))
    } else {
      applyTheme(next)
    }
  }

  const icon =
    'absolute inset-0 m-auto size-[18px] transition-[rotate,scale,opacity] duration-300 ease-out motion-reduce:transition-none'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme ? theme === 'dark' : undefined}
      title={label}
      className="text-muted hover:text-foreground hover:bg-foreground/5 relative size-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Sun in the light theme, moon in the dark theme. Driven by CSS, so it is right before hydration. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className={`${icon} dark:scale-50 dark:-rotate-90 dark:opacity-0`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${icon} scale-50 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100`}
      >
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  )
}
