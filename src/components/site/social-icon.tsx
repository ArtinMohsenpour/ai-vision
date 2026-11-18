/** Simple outline glyphs in currentColor; unknown platforms get a globe. */
export function SocialIcon({ platform }: { platform: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  const paths: Record<string, React.ReactNode> = {
    linkedin: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" {...common} />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" {...common} />
      </>
    ),
    xing: <path d="M5 7l3 5-3 5M16 3l-5 9 3.5 9" {...common} />,
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" {...common} />
        <circle cx="12" cy="12" r="4" {...common} />
        <path d="M17.5 6.5v.01" {...common} />
      </>
    ),
    facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z" {...common} />,
    x: <path d="M4 4l16 16M20 4L4 20" {...common} />,
    youtube: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" {...common} />
        <path d="M10 9l5 3-5 3z" {...common} />
      </>
    ),
    github: (
      <path
        d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5a3 3 0 0 0-1-2.5c3 0 6-1.5 6-6a4.5 4.5 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.6 2.8 5.6 3.1 5.6 3.1a4.2 4.2 0 0 0-.1 3.2A4.5 4.5 0 0 0 4.2 9.5c0 4.5 3 6 6 6a3 3 0 0 0-1 2.5V21"
        {...common}
      />
    ),
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      {paths[platform] ?? (
        <>
          <circle cx="12" cy="12" r="9" {...common} />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" {...common} />
        </>
      )}
    </svg>
  )
}
