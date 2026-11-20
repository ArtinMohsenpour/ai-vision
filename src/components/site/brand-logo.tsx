import { SITE_NAME } from '@/lib/website/metadata'

// The Dom's tall spires, stepped pinnacles, and lancet openings rise above the Rhine.
const FACADE =
  'M10 48v-9h2v-8h2v-6l2.8 2.2L21 3l4.2 24.2L28 25v6h1.5v5l2.5-3.5 2.5 3.5v-5H36v-6l2.8 2.2L43 3l4.2 24.2L50 25v6h2v8h2v6c-7.3 4.2-14.6 4.5-22 1.9-7.7-2.8-14.7-3.1-22 1.1z'
const LANCETS =
  'M19.2 40.4v-6.7c0-1.36.63-2.65 1.8-3.7 1.17 1.05 1.8 2.34 1.8 3.7v6.7z M41.2 42v-8.3c0-1.36.63-2.65 1.8-3.7 1.17 1.05 1.8 2.34 1.8 3.7V42z'
const PORTAL = 'M29.4 44v-3.1c0-2 1.1-3.55 2.6-4.75 1.5 1.2 2.6 2.75 2.6 4.75V44z'
const RHINE =
  'M10 54c7.3-4.2 14.3-3.9 22-1.1 7.4 2.6 14.7 2.3 22-1.9v5c-7.3 4.2-14.6 4.5-22 1.9-7.7-2.8-14.7-3.1-22 1.1z'

// Custom letter outlines keep the lockup consistent at every size.
const WORDMARK = [
  'M0 16h13.2c7.6 0 12.1 4 12.1 10.5 0 5-2.6 8.5-7 9.9L27.1 49h-7.3l-8.4-12H6.2v12H0zm6.2 5.5v10h6.7c3.7 0 6-1.7 6-5s-2.3-5-6-5z', // R
  'M31 15h5.9v12.4c1.8-2.5 4.6-3.7 7.8-3.7 5.6 0 8.9 3.6 8.9 9.5V49h-5.9V35c0-3.8-1.7-5.8-4.9-5.8-3.5 0-5.9 2.5-5.9 6.1V49H31z', // h
  'M70 23.7c7.3 0 11.9 5.4 11.9 12.6 0 .8-.1 1.5-.2 2.2H63c.6 3.8 3.5 6 7.6 6 3 0 5.5-1 7.6-2.8l3.1 3.6c-2.8 2.8-6.6 4.3-10.8 4.3-7.9 0-13.5-5.2-13.5-12.8 0-7.5 5.3-13.1 13-13.1zm-7 10.5h13c-.4-3.6-2.7-5.7-6.1-5.7-3.5 0-6.2 2.3-6.9 5.7z', // e
  'M89.2 13.4l3.8 3.8-3.8 3.8-3.8-3.8zM86.2 24.3h6V49h-6z', // i
  'M97.6 24.3h5.7v3.3c1.9-2.6 4.7-3.9 8-3.9 5.7 0 9 3.6 9 9.5V49h-5.9V35c0-3.8-1.7-5.8-4.9-5.8-3.5 0-6 2.5-6 6.1V49h-5.9z', // n
  'M137 23.7c7.6 0 13.2 5.5 13.2 13s-5.6 13-13.2 13-13.2-5.5-13.2-13 5.6-13 13.2-13zm0 5.4c-4.2 0-7.2 3.1-7.2 7.6s3 7.6 7.2 7.6 7.2-3.1 7.2-7.6-3-7.6-7.2-7.6z', // o
].join(' ')

export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label={SITE_NAME}
      viewBox="4 0 220 64"
      fill="currentColor"
      className={className}
    >
      <path fillRule="evenodd" d={`${FACADE} ${LANCETS} ${PORTAL}`} />
      <path className="fill-primary" d={RHINE} />
      <path transform="translate(73)" fillRule="evenodd" d={WORDMARK} />
    </svg>
  )
}
