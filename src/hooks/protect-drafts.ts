import {
  Forbidden,
  type CollectionBeforeOperationHook,
  type GlobalBeforeOperationHook,
  type PayloadRequest,
} from 'payload'

/**
 * Drafts are work in progress: only the admin may request them. Without this, a visitor
 * could call the REST API with `?draft=true` and read unpublished content.
 */
function rejectPublicDraftRead({
  args,
  operation,
  overrideAccess,
  req,
}: {
  args?: unknown
  operation: string
  overrideAccess?: boolean
  req: PayloadRequest
}) {
  const read = args as { draft?: boolean } | undefined
  if (operation === 'read' && !overrideAccess && req.user?.collection !== 'users' && read?.draft) {
    throw new Forbidden(req.t)
  }
}

export const protectGlobalDrafts: GlobalBeforeOperationHook = (hookArgs) => {
  rejectPublicDraftRead(hookArgs)
  return hookArgs.args
}

export const protectCollectionDrafts: CollectionBeforeOperationHook = (hookArgs) => {
  rejectPublicDraftRead(hookArgs)
  return hookArgs.args
}
