'use client'

import { useEffect, useRef, useState } from 'react'

/** True once the site knows a customer is signed in (false while unknown or signed out). */
export function useCustomerSession(pathname: string) {
  return useCustomerStatus(pathname) === true
}

/** null until the first check finishes, then whether a customer is signed in. */
export function useCustomerStatus(pathname: string) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const lastStatus = useRef<boolean | null>(null)

  useEffect(() => {
    const channel =
      typeof BroadcastChannel === 'function' ? new BroadcastChannel('rheino-session') : null
    let request: AbortController | undefined

    async function refresh(notifyTabs: boolean) {
      request?.abort()
      const current = new AbortController()
      request = current
      try {
        const response = await fetch('/api/customer-session', {
          cache: 'no-store',
          signal: current.signal,
        })
        if (!response.ok) return
        const data = await response.json()
        if (current.signal.aborted || typeof data.authenticated !== 'boolean') return
        const changed = lastStatus.current !== data.authenticated
        lastStatus.current = data.authenticated
        setAuthenticated(data.authenticated)
        if (changed && notifyTabs) channel?.postMessage('refresh')
      } catch {
        // Retry on the next navigation or focus if the connection is interrupted.
      }
    }

    const onFocus = () => void refresh(true)
    const onMessage = () => void refresh(false)
    channel?.addEventListener('message', onMessage)
    window.addEventListener('focus', onFocus)
    window.addEventListener('pageshow', onFocus)
    void refresh(true)

    return () => {
      request?.abort()
      channel?.close()
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('pageshow', onFocus)
    }
  }, [pathname])

  return authenticated
}
