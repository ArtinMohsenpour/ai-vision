import { headers } from 'next/headers'

import { accountOrigin } from './email'

export async function customerRequest() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  const canonical = accountOrigin(origin === 'null' ? null : origin)
  if (
    origin !== canonical &&
    !((!origin || origin === 'null') && requestHeaders.get('sec-fetch-site') === 'same-origin')
  )
    return null
  return { requestHeaders, canonical }
}
