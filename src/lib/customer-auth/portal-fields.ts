import { profileFieldRules, validateAuthField } from './validation/fields'

export const portalFields = [
  'firstName',
  'lastName',
  'company',
  'phone',
  'vatId',
  'street',
  'postalCode',
  'city',
  'country',
] as const
export type PortalField = (typeof portalFields)[number]
export type PortalValues = Record<PortalField, string>
export type ProfileIssue =
  | 'required'
  | 'profileLength'
  | 'tooLong'
  | 'unsafeInput'
  | 'invalidPhone'
  | 'invalidVat'
  | 'invalidCountry'
export type ProfileState = {
  message?: 'profileSaved' | 'rateLimited' | 'unavailable'
  errors?: Partial<Record<PortalField, ProfileIssue>>
}

export const portalMaxLengths: Record<PortalField, number> = {
  firstName: profileFieldRules.firstName.maxLength,
  lastName: profileFieldRules.lastName.maxLength,
  company: profileFieldRules.company.maxLength,
  phone: 32,
  vatId: 32,
  street: 120,
  postalCode: 24,
  city: 85,
  country: 2,
}

export function portalValue(form: FormData, name: string) {
  const value = form.get(name)
  return typeof value === 'string' ? value : ''
}

export function readPortalProfile(form: FormData) {
  return Object.fromEntries(
    portalFields.map((field) => [field, portalValue(form, field)]),
  ) as PortalValues
}

function profileIssue(field: PortalField, value: string): ProfileIssue | undefined {
  if (field === 'firstName' || field === 'lastName' || field === 'company')
    return validateAuthField('signup', field, value, '') as ProfileIssue | undefined
  if (/[<>\p{Cc}\p{Cs}\p{Bidi_Control}]/u.test(value)) return 'unsafeInput'
  const text = value.trim()
  if (text.length > portalMaxLengths[field]) return 'tooLong'
  if (!text) return
  if (field === 'phone' && (!/^\+?[\d ()./-]+$/.test(text) || text.replace(/\D/g, '').length < 3))
    return 'invalidPhone'
  if (field === 'vatId' && !/^[a-z\d][a-z\d .-]+$/i.test(text)) return 'invalidVat'
  if (field === 'country' && !/^[a-z]{2}$/i.test(text)) return 'invalidCountry'
}

export function validatePortalProfile(values: PortalValues) {
  const errors: NonNullable<ProfileState['errors']> = {}
  for (const field of portalFields) {
    const issue = profileIssue(field, values[field])
    if (issue) errors[field] = issue
  }
  return errors
}
