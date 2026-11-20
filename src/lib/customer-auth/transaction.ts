import type { PostgresAdapter } from '@payloadcms/db-postgres'
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from 'payload'

export function authDatabase(req: PayloadRequest) {
  const sessions = req.payload.db.sessions as PostgresAdapter['sessions'] | undefined
  const db = sessions?.[String(req.transactionID)]?.db
  if (!db) throw new Error('Could not open customer auth transaction')
  return db
}

export async function authTransaction<T>(
  payload: Payload,
  work: (req: PayloadRequest, db: ReturnType<typeof authDatabase>) => Promise<T>,
) {
  const req = await createLocalReq({}, payload)
  await initTransaction(req)
  try {
    const result = await work(req, authDatabase(req))
    await commitTransaction(req)
    return result
  } catch (error) {
    await killTransaction(req)
    throw error
  }
}
