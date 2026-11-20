const PASSWORD_MIN = 15
export const PASSWORD_MAX = 128

const commonPasswords = new Set([
  '123456789012345',
  '1234567890123456',
  'passwordpassword',
  'password123456789',
  'qwertyuiopasdfgh',
  'passwortpasswort',
  'letmeinletmeinletmein',
])

export const passwordRules = {
  passwordLength: (value: string) => {
    if (value.length > PASSWORD_MAX * 2) return false
    const length = Array.from(value).length
    return length >= PASSWORD_MIN && length <= PASSWORD_MAX
  },
  passwordUpper: (value: string) => /\p{Lu}/u.test(value),
  passwordLower: (value: string) => /\p{Ll}/u.test(value),
  passwordNumber: (value: string) => /\p{Nd}/u.test(value),
  passwordSymbol: (value: string) => /[\p{P}\p{S}]/u.test(value),
}

export const passwordRuleNames = Object.keys(passwordRules) as (keyof typeof passwordRules)[]

export function newPasswordError(password: string) {
  if (!passwordRules.passwordLength(password)) return 'passwordLength'
  if (/[\p{Cc}\p{Cs}]|<\s*\/?\s*(?:script|iframe|object|embed)\b/iu.test(password))
    return 'unsafeInput'
  if (commonPasswords.has(password.toLowerCase()) || /^(.)\1{14,}$/su.test(password))
    return 'commonPassword'
  return passwordRuleNames.find((rule) => !passwordRules[rule](password))
}
