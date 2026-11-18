/** Array and block rows labelled by their first filled field instead of "Item 01". */
export const rowLabel = (
  fields: string[],
  fallback: string,
  { options, suffix }: { options?: Record<string, string>; suffix?: string } = {},
) => ({
  path: '/components/admin/row-label',
  clientProps: { fields, fallback, options, suffix },
})
