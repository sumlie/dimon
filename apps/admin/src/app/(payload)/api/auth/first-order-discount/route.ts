import { authenticateRequest } from '@/modules/auth/request'

export async function GET(request: Request): Promise<Response> {
  const headers = {
    'Cache-Control': 'no-store',
  }

  try {
    const { payload, user } = await authenticateRequest(request)

    if (!user) {
      return Response.json(
        {
          authenticated: false,
          eligible: false,
          discountPercent: 10,
        },
        { headers },
      )
    }

    if (user.collection !== 'customers' || user.isBlocked) {
      return Response.json(
        { error: 'Аккаунт недоступен' },
        { status: 403, headers },
      )
    }

    const orders = await payload.find({
      collection: 'orders',
      where: {
        customer: { equals: user.id },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    return Response.json(
      {
        authenticated: true,
        eligible: orders.docs.length === 0,
        discountPercent: 10,
      },
      { headers },
    )
  } catch (error) {
    console.error('First order discount check failed:', error)

    return Response.json(
      { error: 'Не удалось проверить скидку' },
      { status: 500, headers },
    )
  }
}