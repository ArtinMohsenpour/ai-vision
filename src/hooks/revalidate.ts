import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { WEBSITE_CACHE_TAG } from '@/lib/website/cache'

/**
 * Public pages are cached (src/lib/website/load.ts). Content is small and linked across pages
 * (navbar → service slugs, footer → navbar logo, cards → services), so any published change
 * expires the whole website cache. `expire: 0` means the next visitor gets fresh content
 * instead of one stale page.
 */
function revalidateWebsite(req: PayloadRequest) {
  if (req.context?.skipRevalidate) return
  try {
    revalidateTag(WEBSITE_CACHE_TAG, { expire: 0 })
  } catch {
    // Outside a Next.js request (seed script, tests) there is no cache to expire.
  }
}

type Status = { _status?: string | null } | null | undefined
// Draft saves do not change what visitors see; publishing or unpublishing does.
const affectsPublicContent = (doc: Status, previousDoc: Status) =>
  !doc?._status || doc._status === 'published' || previousDoc?._status === 'published'

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (affectsPublicContent(doc, previousDoc)) revalidateWebsite(req)
  return doc
}

export const revalidateDocument: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (affectsPublicContent(doc, previousDoc)) revalidateWebsite(req)
  return doc
}

export const revalidateDeletedDocument: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateWebsite(req)
  return doc
}
