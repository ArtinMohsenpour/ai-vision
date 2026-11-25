'use client'

import { FieldDescription, FieldError, FieldLabel, useField, WatchCondition } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'
import { useState } from 'react'

import { parseEuros } from '@/lib/shop/money'

const euros = (cents: number | null | undefined) =>
  typeof cents === 'number'
    ? new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: cents % 100 ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(cents / 100)
    : ''

/** Edits a price stored in cents as euros, the way the owner types it: 350 · 350,50 · 1.200,50. */
const MoneyField: NumberFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage, disabled } = useField<number | null>({ path })
  const [text, setText] = useState(() => euros(value))
  const [unreadable, setUnreadable] = useState(false)
  const [shown, setShown] = useState(value)

  // Follow outside changes (locale switch, reset) without overwriting what is being typed.
  if (value !== shown) {
    setShown(value)
    if (parseEuros(text) !== (value ?? null)) setText(euros(value))
  }

  const label = field.label || undefined
  return (
    <WatchCondition path={path}>
      <div
        className={['field-type', 'text', 'money-field', showError && 'error']
          .filter(Boolean)
          .join(' ')}
      >
        <FieldLabel label={label} path={path} required={field.required} />
        <div className="field-type__wrap">
          <FieldError path={path} showError={showError} message={errorMessage} />
          <div className="money-field__input">
            <input
              id={`field-${path.replace(/\./g, '__')}`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="350 or 1.200,50"
              value={text}
              disabled={readOnly || disabled}
              aria-invalid={unreadable || showError}
              onChange={(event) => {
                const next = event.target.value
                setText(next)
                const cents = next.trim() ? parseEuros(next) : null
                setUnreadable(Boolean(next.trim()) && cents === null)
                setValue(cents)
              }}
              onBlur={() => {
                const cents = parseEuros(text)
                if (cents !== null) setText(euros(cents))
              }}
            />
            <span aria-hidden="true">€</span>
          </div>
          {unreadable && (
            <p className="money-field__hint" role="alert">
              Enter an amount like 350 or 1.200,50.
            </p>
          )}
          <FieldDescription description={field.admin?.description} path={path} />
        </div>
      </div>
    </WatchCondition>
  )
}

export default MoneyField
