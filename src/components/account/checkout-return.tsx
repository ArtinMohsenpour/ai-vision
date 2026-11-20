'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const INTERVAL = 3_000
const ATTEMPTS = 20

/**
 * Shown after the redirect back from Stripe. The redirect itself changes nothing: the page
 * re-reads the order until the webhook has confirmed the payment.
 */
export function CheckoutReturn({ paid }: { paid: boolean }) {
  const t = useTranslations('CustomerPortal')
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (paid || attempts >= ATTEMPTS) return
    const timer = setTimeout(() => {
      router.refresh()
      setAttempts((count) => count + 1)
    }, INTERVAL)
    return () => clearTimeout(timer)
  }, [paid, attempts, router])

  return (
    <div
      role="status"
      className={`mb-6 rounded-2xl p-4 text-sm ${paid ? 'bg-accent text-primary' : 'border border-border'}`}
    >
      {paid ? (
        <p className="font-semibold">{t('paymentReceived')}</p>
      ) : (
        <>
          <p className="font-semibold">{t('confirming')}</p>
          {attempts >= ATTEMPTS && <p className="mt-1 text-muted">{t('confirmingSlow')}</p>}
        </>
      )}
    </div>
  )
}
