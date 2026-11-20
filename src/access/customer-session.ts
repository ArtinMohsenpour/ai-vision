import type { PayloadRequest } from 'payload'

import { hasCustomerSessionGrant } from '@/lib/customer-auth/session-grants'

/**
 * A customer request over HTTP must carry a session that was granted by the website login
 * (src/lib/customer-auth/session-grants.ts). Local API calls are trusted: the website pages check
 * the session themselves before acting for a customer.
 */
export async function hasGrantedCustomerSession(req: PayloadRequest): Promise<boolean> {
  if (req.payloadAPI === 'local' || req.user?.collection !== 'customers') return true
  const sid = '_sid' in req.user && typeof req.user._sid === 'string' ? req.user._sid : null
  return Boolean(sid && (await hasCustomerSessionGrant(req.payload.db.drizzle, req.user.id, sid)))
}
