import { getCustomer } from '@/lib/customer-auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(
    { authenticated: Boolean(await getCustomer()) },
    {
      headers: {
        'Cache-Control': 'private, no-store',
        'Cross-Origin-Resource-Policy': 'same-origin',
      },
    },
  )
}
