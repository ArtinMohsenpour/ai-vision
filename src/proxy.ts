import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'

import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

/** Adds the /de or /en prefix to website routes. Payload's /admin and /api are excluded below. */
export function proxy(request: NextRequest) {
  return handleI18nRouting(request)
}

export const config = {
  // Skip Payload (admin, api), Next internals and files with an extension.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
