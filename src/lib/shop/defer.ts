import { after } from 'next/server'
import type { Payload } from 'payload'

/**
 * Runs a side effect (an email) after the response, so it never delays or fails the request and
 * never runs for a transaction that is rolled back first. Outside a Next.js request (tests,
 * scripts) the task runs right away and the returned promise lets callers wait for it.
 */
export function deferAfterCommit(task: () => Promise<void>, log: Payload['logger']): Promise<void> {
  const run = () =>
    task().catch((error: unknown) => {
      log.warn({ err: error }, 'Shop email could not be sent')
    })
  try {
    after(run)
    return Promise.resolve()
  } catch {
    return run()
  }
}
