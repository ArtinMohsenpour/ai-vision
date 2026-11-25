'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'

import { buttonClass } from '@/components/site/cms-link'
import type { CheckoutState } from '@/lib/shop/checkout-state'

export function PayBalance({
  amount,
  action,
}: {
  amount: string
  action: (state: CheckoutState, form: FormData) => Promise<CheckoutState>
}) {
  const t = useTranslations('CustomerPortal')
  const shop = useTranslations('Shop')
  const [state, formAction, pending] = useActionState(action, {})
  return (
    <form action={formAction} className="mt-6 rounded-2xl bg-accent p-5">
      <p className="text-sm">{t('balanceIntro')}</p>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-[var(--error-text)]">
          {shop(`errors.${state.error}`)}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`mt-4 ${buttonClass('primary')} disabled:opacity-60`}
      >
        {pending ? t('redirecting') : t('payRemaining', { amount })}
      </button>
      <p className="mt-3 text-xs text-muted">{shop('stripeNote')}</p>
    </form>
  )
}
