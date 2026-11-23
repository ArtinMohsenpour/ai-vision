import type { SiteIconName } from '@/fields/icons'

// Simple outline icons (24×24, 1.6 stroke, current text color), chosen by editors for cards.
const paths: Record<SiteIconName, string> = {
  website: 'M3 5h18v14H3zM3 9h18M6 7h.01M9 7h.01',
  speed: 'M13 3 5 14h6l-1 7 8-11h-6z',
  mobile: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM11 18h2',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  shield: 'M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6zM9 12l2 2 4-4',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3M12 15v2',
  language:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3Z',
  accessibility:
    'M12 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 9l7 1.5L19 9M12 10.5V14l-3 6M12 14l3 6',
  design:
    'M12 21a9 9 0 1 1 9-9c0 2-2 3-4 3h-2a2 2 0 0 0-1 4c0 1-1 2-2 2ZM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
  cms: 'M4 5h16v14H4zM4 9h16M9 9v10',
  payment: 'M3 6h18v12H3zM3 10h18M7 15h4',
  chatbot: 'M5 5h14v10H9l-4 4zM9 10h.01M12 10h.01M15 10h.01',
  sparkles:
    'M10 3l1.7 4.3L16 9l-4.3 1.7L10 15l-1.7-4.3L4 9l4.3-1.7zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z',
  automation: 'M4 5h6v5H4zM14 14h6v5h-6zM7 10v4.5a2 2 0 0 0 2 2h5',
  analytics: 'M4 20V10m6 10V4m6 16v-7m6 7H2',
  code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  location:
    'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  support: 'M4 15v-3a8 8 0 0 1 16 0v3M4 14h3v5H4zM17 14h3v5h-3zM20 19c0 1.5-1.5 2.5-3 2.5h-3',
  people: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  shop: 'M3 9l2-5h14l2 5zM5 9v11h14V9M10 20v-6h4v6',
  restaurant: 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 21V3c-2 1.5-3 4-3 7v3h3',
  tools: 'M15 4a5 5 0 0 0-4.6 6.9L4 17.3V20h2.7l6.4-6.4A5 5 0 0 0 20 9l-3 1-2-1-1-2 1-3Z',
  briefcase: 'M3 8h18v11H3zM8 8V5h8v3M3 13h18',
  launch: 'M7 17 17 7M9 7h8v8',
  check: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12l3 3 5-6',
}

export function SiteIcon({ name, size = 24 }: { name: SiteIconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  )
}
