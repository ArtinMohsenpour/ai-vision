import type { ExtraIcon as ExtraIconName } from '@/fields/ordering'

// Simple outline icons (24×24, 1.6 stroke), shown when an extra has no preview image.
const paths: Record<ExtraIconName, string> = {
  cms: 'M4 5h16v14H4zM4 9h16M9 9v10',
  portal: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  chatbot: 'M5 5h14v10H9l-4 4zM9 10h.01M12 10h.01M15 10h.01',
  payment: 'M3 6h18v12H3zM3 10h18M7 15h4',
  seo: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  language: 'M4 5h9M8.5 3v2m3 0c-1 4-4 7-7 8m3-5c1 2 3 4 5 5m2 6 4-10 4 10m-6.5-3h5',
  design:
    'M12 21a9 9 0 1 1 9-9c0 2-2 3-4 3h-2a2 2 0 0 0-1 4c0 1-1 2-2 2ZM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
  analytics: 'M4 20V10m6 10V4m6 16v-7m6 7H2',
  automation: 'M13 3 5 14h6l-1 7 8-11h-6z',
  generic: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5',
}

export function ExtraIcon({ name, size = 24 }: { name: ExtraIconName; size?: number }) {
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
