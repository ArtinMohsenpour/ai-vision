'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { localizedPath } from '@/i18n/routing'
import type { AuthField, AuthMode, FormState } from '@/lib/customer-auth/policy'
import {
  profileFieldRules,
  readAuthForm,
  validateAuthField,
  validateAuthForm,
  type AuthInputs,
} from '@/lib/customer-auth/validation/fields'
import { FeedbackIcon, FieldFeedback, PasswordRequirements } from './auth-feedback'
import styles from './account.module.css'

type Props = {
  mode: AuthMode
  action: (state: FormState, form: FormData) => Promise<FormState>
  status?: 'verified' | 'resetDone' | 'invalidLink'
  /** A validated site path to continue to after login, e.g. an order page. */
  next?: string
}

const subscribeToHash = (listener: () => void) => {
  addEventListener('hashchange', listener)
  return () => removeEventListener('hashchange', listener)
}
const getToken = () => location.hash.slice(1, 128)
const unreadToken = () => null

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 8 8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CustomerForm(props: Props) {
  const fragment = useSyncExternalStore(subscribeToHash, getToken, unreadToken)
  const linkPage = props.mode === 'verify-email' || props.mode === 'reset-password'
  return (
    <CustomerFormContent key={linkPage ? (fragment ?? '') : ''} {...props} fragment={fragment} />
  )
}

function CustomerFormContent({
  mode,
  action,
  status,
  next,
  fragment,
}: Props & { fragment: string | null }) {
  // Keep the "continue to" path when switching between login and signup.
  const keepNext = (pathname: '/login' | '/signup') =>
    next ? { pathname, query: { next } } : pathname
  const t = useTranslations('CustomerAuth')
  const locale = useLocale()
  const [state, formAction, pending] = useActionState(action, {})
  const [showPassword, setShowPassword] = useState(false)
  const [inputs, setInputs] = useState<AuthInputs>(() => state.values ?? {})
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const invalidVerification = mode === 'verify-email' && status === 'invalidLink'
  const token = invalidVerification ? '' : (fragment ?? '')
  const signup = mode === 'signup'
  const reset = mode === 'reset-password'
  const waitingForLink =
    (reset || mode === 'verify-email') && !invalidVerification && fragment === null
  const resumeVerification = mode === 'verify-email' && !waitingForLink && !token
  const choosePassword = reset || signup
  const invalidReset = reset && !waitingForLink && !/^[a-f0-9]{40}$/.test(token)
  const needsFactor =
    mode === 'login' &&
    (state.message === 'secondFactorRequired' || state.message === 'invalidSecondFactor')
  const factorOnly = needsFactor && Boolean(inputs.password)

  useEffect(() => {
    if (state.errors) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    if (needsFactor) form.current?.querySelector<HTMLElement>('#login-factor')?.focus()
  }, [state, needsFactor])

  function submit(event: FormEvent<HTMLFormElement>) {
    const { inputs: submittedInputs, token: submittedToken } = readAuthForm(
      mode,
      new FormData(event.currentTarget),
    )
    const errors = validateAuthForm(mode, submittedToken, submittedInputs)
    setInputs(submittedInputs)
    setSubmitted(true)
    const firstInvalid = Object.keys(errors)[0]
    if (firstInvalid) {
      event.preventDefault()
      const input = event.currentTarget.elements.namedItem(firstInvalid)
      requestAnimationFrame(() => {
        if (input instanceof HTMLElement) input.focus()
      })
    }
  }

  function errorFor(name: AuthField) {
    if (submitted || touched[name]) {
      return validateAuthField(mode, name, inputs[name] ?? '', inputs.password ?? '')
    }
    return state.errors?.[name]
  }

  function field(name: AuthField, label: string, autoComplete: string, type = 'text') {
    const error = errorFor(name)
    const profile =
      name === 'firstName' || name === 'lastName' || name === 'company'
        ? profileFieldRules[name]
        : undefined
    const optional = profile?.required === false
    const feedback =
      error === 'profileLength' && profile
        ? t('errors.profileLength', { min: profile.minLength, max: profile.maxLength })
        : error && t(`errors.${error}`)
    const password = name === 'password' || name === 'confirmation'
    const hint = name === 'password' && choosePassword
    const describedBy = [error && `error-${name}`, hint && 'password-hint']
      .filter(Boolean)
      .join(' ')
    return (
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={name}>
            {label}
            {optional && <span className={styles.optionalLabel}> ({t('optional')})</span>}
          </label>
          {name === 'password' && mode === 'login' && (
            <Link href="/forgot-password">{t('forgotLink')}</Link>
          )}
        </div>
        <div className={styles.inputWrap}>
          <input
            id={name}
            name={name}
            type={password && !showPassword ? 'password' : type}
            className={password && name === 'password' ? styles.withToggle : undefined}
            autoComplete={autoComplete}
            required={!optional}
            value={inputs[name] ?? ''}
            onChange={(event) => {
              const value = event.currentTarget.value
              setInputs((previous) => ({ ...previous, [name]: value }))
            }}
            onBlur={() => setTouched((previous) => ({ ...previous, [name]: true }))}
            autoCapitalize={name === 'email' || password ? 'none' : undefined}
            spellCheck={name === 'email' || password ? false : undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
          />
          {name === 'password' && (
            <button
              type="button"
              className={styles.reveal}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={t(showPassword ? 'hidePassword' : 'showPassword')}
              aria-pressed={showPassword}
              aria-controls={choosePassword ? 'password confirmation' : 'password'}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
                {showPassword && <path d="m4 3 16 18" />}
              </svg>
            </button>
          )}
        </div>
        <FieldFeedback name={name} message={feedback} />
        {hint && <PasswordRequirements password={inputs.password ?? ''} />}
      </div>
    )
  }

  if (state.sent && state.message) {
    return (
      <div className={styles.inbox} role="status">
        <span className={styles.mailIcon}>
          <MailIcon />
        </span>
        <h1 className={styles.title}>{t('checkInbox')}</h1>
        <p className={styles.intro}>{t(`errors.${state.message}`)}</p>
        <p className={styles.help}>{t('checkSpam')}</p>
        <div className={styles.inboxLinks}>
          <Link href="/login" className={styles.secondary}>
            {t('backToLogin')}
          </Link>
          {signup && <Link href="/verify-email">{t('verifyLink')}</Link>}
        </div>
      </div>
    )
  }

  const title = needsFactor
    ? t('factorTitle')
    : resumeVerification
      ? t('resendTitle')
      : t(`${mode}.title`)
  const intro = needsFactor
    ? t('factorBody')
    : resumeVerification
      ? t('resendBody')
      : t(`${mode}.body`)
  const message =
    invalidReset || invalidVerification ? 'invalidLink' : needsFactor ? undefined : state.message
  const businessError = errorFor('business')
  return (
    <>
      {((mode === 'login' && !needsFactor) || signup) && (
        <nav className={styles.switcher}>
          <Link aria-current={mode === 'login' ? 'page' : undefined} href={keepNext('/login')}>
            {t('signIn')}
          </Link>
          <Link aria-current={signup ? 'page' : undefined} href={keepNext('/signup')}>
            {t('signUp')}
          </Link>
        </nav>
      )}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.intro}>{intro}</p>
      {mode === 'login' && !needsFactor && (status === 'verified' || status === 'resetDone') && (
        <p className={styles.success} role="status">
          {t(status)}
        </p>
      )}
      {message && (
        <div key={message} role="alert" className={styles.alert}>
          <FeedbackIcon />
          <div>
            <p>{t(`errors.${message}`)}</p>
            {message === 'unverified' && <Link href="/verify-email">{t('verifyLink')}</Link>}
            {message === 'invalidLink' && reset && (
              <Link href="/forgot-password">{t('resetLink')}</Link>
            )}
          </div>
        </div>
      )}
      {!invalidReset && !waitingForLink && (
        <form action={formAction} ref={form} onSubmit={submit} noValidate aria-busy={pending}>
          <fieldset className={styles.fields} disabled={pending}>
            {next && <input name="next" type="hidden" value={next} />}
            {(reset || mode === 'verify-email') && (
              <input name="token" type="hidden" value={token} />
            )}
            {signup && (
              <>
                <div className={styles.fieldRow}>
                  {field('firstName', t('firstName'), 'given-name')}
                  {field('lastName', t('lastName'), 'family-name')}
                </div>
                {field('company', t('company'), 'organization')}
              </>
            )}
            {factorOnly && (
              <>
                <input type="hidden" name="email" value={inputs.email ?? ''} />
                <input type="hidden" name="password" value={inputs.password ?? ''} />
              </>
            )}
            {!reset &&
              !factorOnly &&
              (mode !== 'verify-email' || resumeVerification) &&
              field('email', t('email'), mode === 'login' ? 'username' : 'email', 'email')}
            {(choosePassword || (mode === 'login' && !factorOnly)) &&
              field(
                'password',
                t(reset ? 'newPassword' : 'password'),
                choosePassword ? 'new-password' : 'current-password',
              )}
            {choosePassword && field('confirmation', t('confirmation'), 'new-password')}
            {needsFactor && (
              <div className={styles.field}>
                <label htmlFor="login-factor" className={styles.labelRow}>
                  {t('factorLabel')}
                </label>
                <div className={styles.inputWrap}>
                  <input
                    id="login-factor"
                    name="factor"
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={64}
                    required
                    aria-invalid={state.message === 'invalidSecondFactor'}
                    aria-describedby={
                      state.message === 'invalidSecondFactor' ? 'error-login-factor' : undefined
                    }
                  />
                </div>
                <FieldFeedback
                  name="login-factor"
                  message={
                    state.message === 'invalidSecondFactor'
                      ? t('errors.invalidSecondFactor')
                      : undefined
                  }
                />
              </div>
            )}
            {signup && (
              <div className={styles.attestation}>
                <label>
                  <input
                    type="checkbox"
                    id="business"
                    name="business"
                    value="yes"
                    required
                    checked={inputs.business === 'yes'}
                    onChange={(event) => {
                      const business = event.currentTarget.checked ? 'yes' : ''
                      setInputs((previous) => ({ ...previous, business }))
                      setTouched((previous) => ({ ...previous, business: true }))
                    }}
                    aria-invalid={Boolean(businessError)}
                    aria-describedby={businessError ? 'error-business' : undefined}
                  />
                  <span>{t('business')}</span>
                </label>
                <FieldFeedback
                  name="business"
                  message={businessError ? t(`errors.${businessError}`) : undefined}
                />
                <Link href="/privacy">{t('privacy')}</Link>
              </div>
            )}
            <button type="submit" className={styles.submit}>
              {pending
                ? t('pending')
                : t(
                    needsFactor ? 'factorSubmit' : resumeVerification ? 'resend' : `${mode}.submit`,
                  )}
              {!pending && <span aria-hidden="true">→</span>}
            </button>
          </fieldset>
        </form>
      )}
      {needsFactor ? (
        <p className={styles.bottom}>
          <a href={localizedPath(locale, '/login')}>{t('backToLogin')}</a>
        </p>
      ) : mode === 'login' ? (
        <p className={styles.bottom}>
          {t('newHere')} <Link href={keepNext('/signup')}>{t('signUp')}</Link>
        </p>
      ) : mode === 'signup' ? (
        <p className={styles.bottom}>
          {t('alreadyRegistered')} <Link href={keepNext('/login')}>{t('signIn')}</Link>
        </p>
      ) : (
        <p className={styles.bottom}>
          <Link href="/login">← {t('backToLogin')}</Link>
        </p>
      )}
    </>
  )
}
