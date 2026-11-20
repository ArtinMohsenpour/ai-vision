export const CUSTOMER_SESSION_SECONDS = 8 * 60 * 60

export const authModes = [
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'verify-email',
] as const
export type AuthMode = (typeof authModes)[number]
export type AuthField =
  'email' | 'password' | 'confirmation' | 'firstName' | 'lastName' | 'company' | 'business'
export type AuthMessage =
  | 'required'
  | 'invalidEmail'
  | 'passwordLength'
  | 'passwordUpper'
  | 'passwordLower'
  | 'passwordNumber'
  | 'passwordSymbol'
  | 'commonPassword'
  | 'passwordMismatch'
  | 'businessRequired'
  | 'tooLong'
  | 'profileLength'
  | 'unsafeInput'
  | 'invalidCredentials'
  | 'secondFactorRequired'
  | 'invalidSecondFactor'
  | 'unverified'
  | 'invalidLink'
  | 'rateLimited'
  | 'unavailable'
  | 'signupSent'
  | 'resetSent'
  | 'verificationSent'
export type FormState = {
  errors?: Partial<Record<AuthField, AuthMessage>>
  message?: AuthMessage
  sent?: boolean
  values?: Partial<Record<Exclude<AuthField, 'password' | 'confirmation'>, string>>
}
