import { describe, expect, it } from 'vitest'

import {
  readAuthForm,
  validateAuthField,
  validateAuthForm,
} from '@/lib/customer-auth/validation/fields'

describe('customer auth input validation', () => {
  it('validates a registration form without altering passwords', () => {
    const form = new FormData()
    const password = '  Wasser am Rhein 26!  '
    for (const [key, value] of Object.entries({
      firstName: 'İpek',
      lastName: 'O’Connor',
      company: 'Müller-Söhne & Co.',
      email: 'customer+studio@example.test',
      password,
      confirmation: password,
      business: 'yes',
    }))
      form.set(key, value)

    const { token, inputs } = readAuthForm('signup', form)
    expect(validateAuthForm('signup', token, inputs)).toEqual({})
    expect(inputs.password).toBe(password)
    form.set('confirmation', password.trim())
    expect(validateAuthForm('signup', token, readAuthForm('signup', form).inputs)).toEqual({
      confirmation: 'passwordMismatch',
    })
  })

  it('rejects malformed addresses and profile fields containing markup or controls', () => {
    expect(validateAuthField('signup', 'email', 'first..last@example.test', '')).toBe(
      'invalidEmail',
    )
    expect(validateAuthField('signup', 'email', 'someone@-example.test', '')).toBe('invalidEmail')
    expect(validateAuthField('signup', 'email', 'someone@example.99', '')).toBe('invalidEmail')
    expect(validateAuthField('signup', 'email', 'someone@example.test\r\n', '')).toBe(
      'invalidEmail',
    )
    expect(validateAuthField('signup', 'company', '<script>', '')).toBe('unsafeInput')
  })

  it('requires bounded first and last names and validates the optional company when present', () => {
    for (const field of ['firstName', 'lastName'] as const) {
      expect(validateAuthField('signup', field, '', '')).toBe('required')
      expect(validateAuthField('signup', field, '  A  ', '')).toBe('profileLength')
      expect(validateAuthField('signup', field, 'e\u0301', '')).toBe('profileLength')
      expect(validateAuthField('signup', field, 'Li', '')).toBeUndefined()
      expect(validateAuthField('signup', field, 'A'.repeat(75), '')).toBeUndefined()
      expect(validateAuthField('signup', field, 'A'.repeat(76), '')).toBe('profileLength')
    }
    expect(validateAuthField('signup', 'company', '', '')).toBeUndefined()
    expect(validateAuthField('signup', 'company', '   ', '')).toBeUndefined()
    expect(validateAuthField('signup', 'company', 'X', '')).toBe('profileLength')
    expect(validateAuthField('signup', 'company', 'C'.repeat(150), '')).toBeUndefined()
    expect(validateAuthField('signup', 'company', 'C'.repeat(151), '')).toBe('profileLength')
  })

  it('requires complexity only when choosing a password and bounds both password fields', () => {
    expect(
      validateAuthField('login', 'password', 'A prior passphrase without punctuation 9', ''),
    ).toBeUndefined()
    expect(
      validateAuthField('signup', 'password', 'A prior passphrase without punctuation 9', ''),
    ).toBe('passwordSymbol')
    expect(
      validateAuthField('reset-password', 'password', 'RHEINO WITH NO LOWER CASE 46!', ''),
    ).toBe('passwordLower')
    expect(validateAuthField('signup', 'password', 'Bad <script> password 42!', '')).toBe(
      'unsafeInput',
    )
    expect(validateAuthField('signup', 'password', 'Ab1!' + '🌧'.repeat(124), '')).toBeUndefined()
    expect(validateAuthField('signup', 'password', 'Ab1!' + '🌧'.repeat(125), '')).toBe(
      'passwordLength',
    )
    expect(validateAuthField('reset-password', 'confirmation', 'a'.repeat(257), '')).toBe('tooLong')
  })
})
