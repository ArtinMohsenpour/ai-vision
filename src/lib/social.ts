export const socialPlatforms = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'xing', label: 'XING' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'website', label: 'Website' },
] as const

export type SocialPlatform = (typeof socialPlatforms)[number]['value']

export const socialLabel = (value: string) =>
  socialPlatforms.find((platform) => platform.value === value)?.label ?? value
