import type { AuthField, AuthMessage, AuthMode } from '../policy'
import { newPasswordError, PASSWORD_MAX } from './password'

export type AuthInputs = Partial<Record<AuthField, string>>

export const profileFieldRules = {
  firstName: { required: true, minLength: 2, maxLength: 75 },
  lastName: { required: true, minLength: 2, maxLength: 75 },
  company: { required: false, minLength: 2, maxLength: 150 },
}
const signupFields = [
  'firstName',
  'lastName',
  'company',
  'email',
  'password',
  'confirmation',
  'business',
] as const
const emailLocal = /^[a-z\d!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z\d!#$%&'*+/=?^_`{|}~-]+)*$/i
// Keep the accepted address format within Payload's email validator.
const emailDomain = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i
const control = /[\p{Cc}\p{Cs}\p{Bidi_Control}]/u

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

function authFields(mode: AuthMode, hasToken: boolean): readonly AuthField[] {
  if (mode === 'signup') return signupFields
  if (mode === 'login') return ['email', 'password']
  if (mode === 'reset-password') return ['password', 'confirmation']
  if (mode === 'verify-email' && hasToken) return []
  return ['email']
}

export function readAuthForm(mode: AuthMode, form: FormData) {
  const read = (key: string) => {
    const value = form.get(key)
    return typeof value === 'string' ? value : ''
  }
  const token = read('token')
  const inputs: AuthInputs = {}
  for (const field of authFields(mode, Boolean(token))) inputs[field] = read(field)
  return { token, inputs }
}

export function validateAuthField(
  mode: AuthMode,
  field: AuthField,
  value: string,
  password: string,
): AuthMessage | undefined {
  switch (field) {
    case 'password':
      if (!value.trim()) return 'required'
      // Existing credentials are still valid under the rules in effect when they were set.
      if (mode === 'login') return value.length > PASSWORD_MAX * 2 ? 'tooLong' : undefined
      return newPasswordError(value)
    case 'confirmation':
      if (!value) return 'required'
      if (value.length > PASSWORD_MAX * 2) return 'tooLong'
      if (value !== password) return 'passwordMismatch'
      break
    case 'business':
      if (value !== 'yes') return 'businessRequired'
      break
    case 'email': {
      if (value.length > 254) return 'tooLong'
      if (control.test(value)) return 'invalidEmail'
      const email = value.trim()
      if (!email) return 'required'
      const [local, domain, extra] = email.split('@')
      if (
        extra !== undefined ||
        local.length > 64 ||
        !emailLocal.test(local) ||
        !domain ||
        !emailDomain.test(domain)
      )
        return 'invalidEmail'
      break
    }
    default: {
      const { required, minLength, maxLength } = profileFieldRules[field]
      const text = value.trim()
      if (text.length > maxLength) return 'profileLength'
      if (control.test(value) || /[<>]/.test(value)) return 'unsafeInput'
      if (!text) return required ? 'required' : undefined
      if (Array.from(text.normalize('NFC')).length < minLength) return 'profileLength'
    }
  }
}

export function validateAuthForm(mode: AuthMode, token: string, inputs: AuthInputs) {
  const errors: Partial<Record<AuthField, AuthMessage>> = {}
  for (const field of authFields(mode, Boolean(token))) {
    const error = validateAuthField(mode, field, inputs[field] ?? '', inputs.password ?? '')
    if (error) errors[field] = error
  }
  return errors
}
