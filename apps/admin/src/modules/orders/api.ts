import config from '@payload-config'
import { getPayload } from 'payload'

import type { Order } from '@/payloadTypes'

type CheckoutItem = {
  product: number
  quantity: number
}

type CheckoutBody = {
  items: CheckoutItem[]
  customerName: string
  username: string
  email: string
  phone?: string
  deliveryMethod?: string
  deliveryAddress?: string
  paymentMethod?: string
}

const badRequest = (error: string) => Response.json({ error }, { status: 400 })

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const validateBody = (value: unknown): CheckoutBody | string => {
  if (!value || typeof value !== 'object') return 'Некорректное тело запроса'

  const body = value as Partial<CheckoutBody>

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return 'Заказ должен содержать хотя бы один товар'
  }

  for (const item of body.items) {
    if (
      !item ||
      typeof item !== 'object' ||
      !isPositiveInteger(item.product) ||
      !isPositiveInteger(item.quantity)
    ) {
      return 'Некорректный товар в заказе'
    }
  }

  if (
    !isNonEmptyString(body.customerName) ||
    !isNonEmptyString(body.username) ||
    !isNonEmptyString(body.email)
  ) {
    return 'Не заполнены обязательные поля покупателя'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Некорректный email'
  }

  return body as CheckoutBody
}

export async function POST(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return badRequest('Некорректный JSON')
  }

  const body = validateBody(rawBody)

  if (typeof body === 'string') {
    return badRequest(body)
  }

  const payload = await getPayload({ config })

  try {
    const ids = [...new Set(body.items.map((item) => item.product))]
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { id: { in: ids }, status: { equals: 'published' } },
      pagination: false,
      overrideAccess: true,
    })

    const productsById = new Map(products.map((product) => [product.id, product]))
    const missingIds = ids.filter((id) => !productsById.has(id))

    if (missingIds.length > 0) {
      return Response.json(
        { error: `Товар не найден: ${missingIds.join(', ')}` },
        { status: 404 },
      )
    }

    const items: Order['items'] = body.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: productsById.get(item.product)!.priceRub,
    }))

    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        items,
        total,
        status: 'new',
        paymentStatus: 'pending',
        customerName: body.customerName,
        username: body.username,
        email: body.email,
        phone: body.phone,
        deliveryMethod: body.deliveryMethod,
        deliveryAddress: body.deliveryAddress,
        paymentMethod: body.paymentMethod,
      },
    })

    return Response.json({ id: order.id })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Checkout failed' })

    return Response.json({ error: 'Не удалось создать заказ' }, { status: 500 })
  }
}
