import { accountMetadata, AuthPage, type AuthPageProps } from '@/components/account/auth-page'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: AuthPageProps) {
  return accountMetadata(params, 'signup.title')
}

export default function Page(props: AuthPageProps) {
  return <AuthPage mode="signup" {...props} />
}
