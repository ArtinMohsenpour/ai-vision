const iconPaths = {
  profile: 'M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 20v-1a7 7 0 0 1 14 0v1',
  security: 'M12 22s7-3 7-10V6l-7-3-7 3v6c0 7 7 10 7 10Zm-3-10 2 2 4-4',
  verified: 'm6 12 4 4 8-8',
  arrow: 'm9 6 6 6-6 6',
  logout: 'M10 17l5-5-5-5m5 5H3m10-8h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5',
  orders: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  password: 'M7 11V8a5 5 0 0 1 10 0v3m-11 0h12a2 2 0 0 1 2 2v7H4v-7a2 2 0 0 1 2-2Zm6 4v2',
} as const

export function PortalIcon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}
