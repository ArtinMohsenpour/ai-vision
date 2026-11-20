'use client'

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

import {
  portalMaxLengths,
  readPortalProfile,
  validatePortalProfile,
  type PortalField,
  type PortalValues,
  type ProfileState,
} from '@/lib/customer-auth/portal-fields'
import { profileFieldRules } from '@/lib/customer-auth/validation/fields'
import { FeedbackIcon, FieldFeedback } from './auth-feedback'
import authStyles from './account.module.css'
import styles from './portal.module.css'

export function PortalProfile({
  email,
  initial,
  action,
}: {
  email: string
  initial: PortalValues
  action: (state: ProfileState, form: FormData) => Promise<ProfileState>
}) {
  const t = useTranslations('CustomerPortal')
  const auth = useTranslations('CustomerAuth')
  const [state, submitForm, pending] = useActionState(action, {})
  const [values, setValues] = useState(initial)
  const [submitted, setSubmitted] = useState(false)
  const [dirty, setDirty] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = submitted ? validatePortalProfile(values) : state.errors

  useEffect(() => {
    if (state.errors) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [state])

  function submit(event: FormEvent<HTMLFormElement>) {
    const values = readPortalProfile(new FormData(event.currentTarget))
    const first = Object.keys(validatePortalProfile(values))[0]
    setValues(values)
    setSubmitted(true)
    if (first) {
      event.preventDefault()
      const element = event.currentTarget.elements.namedItem(first)
      requestAnimationFrame(() => {
        if (element instanceof HTMLElement) element.focus()
      })
    } else setDirty(false)
  }

  function field(name: PortalField, autoComplete: string, type = 'text') {
    const issue = errors?.[name]
    const needed = name === 'firstName' || name === 'lastName'
    let feedback: string | undefined
    if (issue === 'profileLength') {
      feedback = auth('errors.profileLength', {
        min: profileFieldRules.firstName.minLength,
        max: portalMaxLengths[name],
      })
    } else if (issue === 'tooLong') {
      feedback = t('maxLength', { max: portalMaxLengths[name] })
    } else if (issue === 'invalidPhone' || issue === 'invalidVat' || issue === 'invalidCountry') {
      feedback = t(issue)
    } else if (issue) {
      feedback = auth(`errors.${issue}`)
    }
    return (
      <div className={authStyles.field}>
        <label htmlFor={name} className={authStyles.labelRow}>
          {t(name)}
        </label>
        <div className={authStyles.inputWrap}>
          <input
            id={name}
            name={name}
            value={values[name]}
            autoComplete={autoComplete}
            type={type}
            required={needed}
            aria-invalid={Boolean(issue)}
            aria-describedby={issue ? `error-${name}` : undefined}
            onChange={(event) => {
              const value = event.currentTarget.value
              setDirty(true)
              setValues((previous) => ({ ...previous, [name]: value }))
            }}
          />
        </div>
        <FieldFeedback name={name} message={feedback} />
      </div>
    )
  }

  return (
    <section className={styles.card} aria-labelledby="profile-heading">
      <div className={styles.cardHeading}>
        <h2 id="profile-heading">{t('profileTitle')}</h2>
        <p>{t('profileIntro')}</p>
      </div>
      <form action={submitForm} onSubmit={submit} ref={formRef} noValidate aria-busy={pending}>
        <fieldset disabled={pending} className={styles.profileFields}>
          <div className={styles.fieldsGrid}>
            {field('firstName', 'given-name')}
            {field('lastName', 'family-name')}
            {field('company', 'organization')}
            {field('phone', 'tel', 'tel')}
          </div>
          <div className={styles.email}>
            <span>{auth('email')}</span>
            <strong>{email}</strong>
            <p>{t('emailHint')}</p>
          </div>
          <div className={styles.formSection}>
            <h3>{t('businessDetails')}</h3>
            <div className={styles.fieldsGrid}>
              <div className={styles.fullRow}>{field('street', 'street-address')}</div>
              {field('postalCode', 'postal-code')}
              {field('city', 'address-level2')}
              {field('country', 'country')}
              {field('vatId', 'off')}
            </div>
          </div>
          <div className={styles.formFooter}>
            <button type="submit" className={styles.primary}>
              {pending ? t('saving') : t('saveProfile')}
            </button>
            {state.message === 'profileSaved' && !dirty && (
              <p role="status" className={styles.saved}>
                {t('profileSaved')}
              </p>
            )}
          </div>
          {state.message && state.message !== 'profileSaved' && (
            <div role="alert" className={authStyles.alert}>
              <FeedbackIcon />
              {auth(`errors.${state.message}`)}
            </div>
          )}
        </fieldset>
      </form>
    </section>
  )
}
