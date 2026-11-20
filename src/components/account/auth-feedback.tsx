'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { passwordRuleNames, passwordRules } from '@/lib/customer-auth/validation/password'
import styles from './account.module.css'

export function FeedbackIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.errorIcon}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.75v3.5M8 11h.01" strokeLinecap="round" />
    </svg>
  )
}

export function FieldFeedback({ name, message }: { name: string; message?: string }) {
  const [lastMessage, setLastMessage] = useState(message)
  // Keep the last message in the layout long enough for the panel to collapse.
  if (message && message !== lastMessage) setLastMessage(message)

  return (
    <>
      <div className={styles.feedback} data-visible={Boolean(message)} aria-hidden={!message}>
        <div className={styles.feedbackInner}>
          <p id={`error-${name}`} className={styles.fieldError}>
            <FeedbackIcon />
            <span key={lastMessage} className={styles.errorCopy}>
              {lastMessage}
            </span>
          </p>
        </div>
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {message}
      </span>
    </>
  )
}

export function PasswordRequirements({ password }: { password: string }) {
  const t = useTranslations('CustomerAuth')
  return (
    <div id="password-hint" className={styles.passwordRules}>
      <p>{t('passwordRequirements')}</p>
      <ul>
        {passwordRuleNames.map((rule) => {
          const passed = passwordRules[rule](password)
          return (
            <li key={rule} data-passed={passed}>
              <span className={styles.ruleIcon} aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="m3 7 2.4 2.4L11 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{t(`requirements.${rule}`)}</span>
              <span className="sr-only">{t(passed ? 'ruleMet' : 'ruleMissing')}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
