import type { NumberField } from 'payload'

const MAX_CENTS = 10_000_000

/**
 * A price in integer cents, edited as euros ("350" or "1.200,50") with the money field component.
 * `required` may depend on sibling data, e.g. only when a service can be ordered online.
 */
export function moneyField(
  name: string,
  {
    label,
    description,
    required = true,
    allowZero = false,
  }: {
    label: string
    description?: string
    required?: boolean | ((siblingData: Record<string, unknown>) => boolean)
    /** For read-only totals such as "paid so far". */
    allowZero?: boolean
  },
): NumberField {
  return {
    name,
    type: 'number',
    label,
    min: allowZero ? 0 : 1,
    max: MAX_CENTS,
    validate: (value: number | number[] | null | undefined, { siblingData }) => {
      const needed =
        typeof required === 'function'
          ? required((siblingData ?? {}) as Record<string, unknown>)
          : required
      if (value === null || value === undefined) return needed ? 'Enter a price.' : true
      const min = allowZero ? 0 : 1
      if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > MAX_CENTS)
        return 'Enter a price between 0,01 € and 100.000 €.'
      return true
    },
    admin: {
      description,
      components: { Field: '/components/admin/money-field' },
    },
  }
}
