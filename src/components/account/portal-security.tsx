'use client'

import Image from 'next/image'
import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'

import type { SecurityState } from '@/lib/customer-auth/portal-actions'
import { FeedbackIcon, FieldFeedback, PasswordRequirements } from './auth-feedback'
import { PortalIcon } from './portal-icons'
import authStyles from './account.module.css'
import styles from './portal.module.css'

type SecurityAction = (previous: SecurityState, form: FormData) => Promise<SecurityState>
type SecurityField = keyof NonNullable<SecurityState['errors']>

function Field({
  prefix,
  name,
  error,
  recovery = false,
  value,
  onChange,
}: {
  prefix: string
  name: SecurityField
  error?: NonNullable<SecurityState['errors']>[SecurityField]
  recovery?: boolean
  value?: string
  onChange?: (value: string) => void
}) {
  const portal = useTranslations('CustomerPortal')
  const auth = useTranslations('CustomerAuth')
  const id = `${prefix}-${name}`
  const isFactor = name === 'factor'
  const label =
    name === 'currentPassword'
      ? portal('currentPassword')
      : isFactor
        ? recovery
          ? auth('factorLabel')
          : portal('authenticatorCode')
        : auth(name === 'password' ? 'newPassword' : 'confirmation')
  return (
    <div className={authStyles.field}>
      <label htmlFor={id} className={authStyles.labelRow}>
        {label}
      </label>
      <div className={authStyles.inputWrap}>
        <input
          id={id}
          name={name}
          type={isFactor ? 'text' : 'password'}
          required
          inputMode={isFactor && !recovery ? 'numeric' : undefined}
          autoComplete={
            isFactor
              ? 'one-time-code'
              : name === 'currentPassword'
                ? 'current-password'
                : 'new-password'
          }
          spellCheck={false}
          autoCapitalize="none"
          maxLength={isFactor ? (recovery ? 64 : 6) : undefined}
          value={value}
          onChange={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [error && `error-${id}`, name === 'password' && 'password-hint']
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
      </div>
      <FieldFeedback name={id} message={error ? auth(`errors.${error}`) : undefined} />
    </div>
  )
}

function SecurityFeedback({ message }: Pick<SecurityState, 'message'>) {
  const portal = useTranslations('CustomerPortal')
  const auth = useTranslations('CustomerAuth')
  if (!message) return null
  if (message === 'mfaDisabled')
    return (
      <p className={styles.saved} role="status">
        {portal('mfaDisabled')}
      </p>
    )
  const copy =
    message === 'setupExpired' ||
    message === 'invalidCredentials' ||
    message === 'secondFactorRequired'
      ? portal(message)
      : auth(`errors.${message}`)
  return (
    <div role="alert" className={authStyles.alert}>
      <FeedbackIcon />
      {copy}
    </div>
  )
}

function PasswordCard({ enabled, action }: { enabled: boolean; action: SecurityAction }) {
  const t = useTranslations('CustomerPortal')
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [state, update, pending] = useActionState(action, {})
  return (
    <section className={styles.card} aria-labelledby="password-heading">
      <div className={styles.settingHeader}>
        <span className={styles.settingIcon}>
          <PortalIcon name="password" />
        </span>
        <div className={styles.settingTitle}>
          <h3 id="password-heading">{t('passwordTitle')}</h3>
          <p>{t('passwordIntro')}</p>
        </div>
        {!open && (
          <button className={styles.secondary} type="button" onClick={() => setOpen(true)}>
            {t('changePassword')}
          </button>
        )}
      </div>
      {open && (
        <form action={update} className={styles.securityForm} aria-busy={pending}>
          <fieldset className={styles.securityFields} disabled={pending}>
            <Field prefix="change" name="currentPassword" error={state.errors?.currentPassword} />
            <Field
              prefix="change"
              name="password"
              error={state.errors?.password}
              value={password}
              onChange={setPassword}
            />
            <PasswordRequirements password={password} />
            <Field prefix="change" name="confirmation" error={state.errors?.confirmation} />
            {enabled && (
              <Field prefix="change" name="factor" recovery error={state.errors?.factor} />
            )}
            <SecurityFeedback message={state.message} />
            <div className={styles.formFooter}>
              <button className={styles.primary} type="submit">
                {pending ? t('saving') : t('changePassword')}
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => {
                  setOpen(false)
                  setPassword('')
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  )
}

function RecoveryCodes({ codes, onClose }: { codes: string[]; onClose: () => void }) {
  const t = useTranslations('CustomerPortal')
  const text = ['Rheino', t('recoveryTitle'), '', ...codes].join('\n')
  return (
    <div className={styles.enrollment}>
      <h4>{t('recoveryTitle')}</h4>
      <p>{t('recoveryIntro')}</p>
      <ul className={styles.recoveryCodes} aria-label={t('recoveryTitle')}>
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ul>
      <div className={styles.formFooter}>
        <a
          className={styles.primary}
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}
          download="rheino-recovery-codes.txt"
        >
          {t('downloadCodes')}
        </a>
        <button className={styles.secondary} type="button" onClick={onClose}>
          {t('done')}
        </button>
      </div>
    </div>
  )
}

function AuthenticatorCard({
  enabled,
  start,
  activate,
  disable,
}: {
  enabled: boolean
  start: SecurityAction
  activate: SecurityAction
  disable: SecurityAction
}) {
  const t = useTranslations('CustomerPortal')
  const [configure, setConfigure] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [setupInfo, setSetupInfo] = useState<SecurityState['setup']>()
  const [recovery, setRecovery] = useState<string[]>()
  const [setup, begin, starting] = useActionState(
    async (previous: SecurityState, form: FormData) => {
      const { setup, ...feedback } = await start(previous, form)
      setSetupInfo(setup)
      return feedback
    },
    {},
  )
  const [activation, confirm, activating] = useActionState(
    async (previous: SecurityState, form: FormData) => {
      const { recoveryCodes, ...feedback } = await activate(previous, form)
      if (recoveryCodes || feedback.message === 'setupExpired') setSetupInfo(undefined)
      if (recoveryCodes) setRecovery(recoveryCodes)
      return feedback
    },
    {},
  )
  const [removal, remove, disabling] = useActionState(
    async (previous: SecurityState, form: FormData) => {
      const feedback = await disable(previous, form)
      if (feedback.message === 'mfaDisabled') {
        setConfigure(false)
        setRemoving(false)
      }
      return feedback
    },
    {},
  )

  return (
    <section className={styles.card} aria-labelledby="mfa-heading">
      <div className={styles.settingHeader}>
        <span className={styles.settingIcon}>
          <PortalIcon name="security" />
        </span>
        <div className={styles.settingTitle}>
          <h3 id="mfa-heading">{t('mfaTitle')}</h3>
          <p>{t('mfaIntro')}</p>
        </div>
        <span className={styles.factorStatus} data-enabled={enabled}>
          <span />
          {t(enabled ? 'enabled' : 'disabled')}
        </span>
      </div>
      {recovery ? (
        <RecoveryCodes codes={recovery} onClose={() => setRecovery(undefined)} />
      ) : enabled ? (
        <div className={styles.securityForm}>
          {!removing ? (
            <button type="button" className={styles.secondary} onClick={() => setRemoving(true)}>
              {t('disableMfa')}
            </button>
          ) : (
            <form action={remove} aria-busy={disabling}>
              <fieldset className={styles.securityFields} disabled={disabling}>
                <p className={styles.formNote}>{t('disableBody')}</p>
                <Field
                  prefix="disable"
                  name="currentPassword"
                  error={removal.errors?.currentPassword}
                />
                <Field prefix="disable" name="factor" recovery error={removal.errors?.factor} />
                <SecurityFeedback message={removal.message} />
                <div className={styles.formFooter}>
                  <button type="submit" className={styles.danger}>
                    {disabling ? t('saving') : t('disableMfa')}
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setRemoving(false)}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      ) : setupInfo ? (
        <div className={styles.enrollment}>
          <h4>{t('scanTitle')}</h4>
          <p>{t('scanBody')}</p>
          <div className={styles.setupGrid}>
            <Image
              unoptimized
              src={setupInfo.qr}
              width={224}
              height={224}
              alt={t('qrAlt')}
              className={styles.qr}
            />
            <div className={styles.setupKey}>
              <p>{t('manualKey')}</p>
              <code>{setupInfo.key}</code>
            </div>
          </div>
          <form action={confirm} aria-busy={activating}>
            <fieldset className={styles.securityFields} disabled={activating}>
              <Field prefix="activate" name="factor" error={activation.errors?.factor} />
              <SecurityFeedback message={activation.message} />
              <div className={styles.formFooter}>
                <button type="submit" className={styles.primary}>
                  {activating ? t('saving') : t('enableMfa')}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      ) : (
        <div className={styles.securityForm}>
          <SecurityFeedback
            message={
              activation.message === 'setupExpired'
                ? activation.message
                : configure
                  ? undefined
                  : removal.message
            }
          />
          {!configure ? (
            <button type="button" className={styles.primary} onClick={() => setConfigure(true)}>
              {t('setUpMfa')}
            </button>
          ) : (
            <form action={begin} aria-busy={starting}>
              <fieldset className={styles.securityFields} disabled={starting}>
                <Field
                  prefix="setup"
                  name="currentPassword"
                  error={setup.errors?.currentPassword}
                />
                <SecurityFeedback message={setup.message} />
                <div className={styles.formFooter}>
                  <button type="submit" className={styles.primary}>
                    {starting ? t('saving') : t('continueSetup')}
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setConfigure(false)}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </section>
  )
}

export function PortalSecurity({
  enabled,
  password,
  start,
  activate,
  disable,
}: {
  enabled: boolean
  password: SecurityAction
  start: SecurityAction
  activate: SecurityAction
  disable: SecurityAction
}) {
  const t = useTranslations('CustomerPortal')
  return (
    <div className={styles.security}>
      <div className={styles.securityHeading}>
        <h2>{t('securityTitle')}</h2>
        <p>{t('securityIntro')}</p>
      </div>
      <PasswordCard enabled={enabled} action={password} />
      <AuthenticatorCard enabled={enabled} start={start} activate={activate} disable={disable} />
    </div>
  )
}
