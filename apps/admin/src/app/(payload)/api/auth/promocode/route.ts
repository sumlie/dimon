import config from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request): Promise<Response> {
  let input: unknown

  try {
    input = await request.json()
  } catch {
    return Response.json(
      { error: 'Некорректный запрос' },
      { status: 400 },
    )
  }

  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    !('code' in input) ||
    typeof input.code !== 'string'
  ) {
    return Response.json(
      { error: 'Введи промокод' },
      { status: 400 },
    )
  }

  const code = input.code.trim().toUpperCase()

  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
    return Response.json(
      { error: 'Некорректный промокод' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'promo-codes',
      where: {
        code: { equals: code },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const promo = result.docs[0]
    const now = Date.now()

    const startsAt = promo?.startsAt
      ? new Date(promo.startsAt).getTime()
      : null

    const expiresAt = promo?.expiresAt
      ? new Date(promo.expiresAt).getTime()
      : null

    const unavailable =
      !promo ||
      !promo.isActive ||
      (startsAt !== null && (!Number.isFinite(startsAt) || startsAt > now)) ||
      (expiresAt !== null && (!Number.isFinite(expiresAt) || expiresAt <= now)) ||
      (promo.maxUses != null && promo.usedCount >= promo.maxUses)

    if (unavailable) {
      return Response.json(
        { error: 'Промокод недействителен или закончился' },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    }

    return Response.json(
      {
        code: promo.code,
        discountPercent: promo.discountPercent,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('Promo code check failed:', error)

    return Response.json(
      { error: 'Не удалось проверить промокод' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}