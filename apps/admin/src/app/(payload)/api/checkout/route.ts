import { getPayload } from 'payload';
import type { Order } from '@/payload-types'
import config from '@payload-config'

type CheckoutBody = {
  items: { product: number; quantity: number }[]
  customerName: string
  username: string
  email: string
  phone?: string
  deliveryMethod?: string
  deliveryAddress?: string
  paymentMethod?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutBody
  const payload = await getPayload({ config })

  const ids = body.items.map((i) => i.product)
  const { docs: products } = await payload.find({
    collection: 'products',
    where: { id: { in: ids }, status: { equals: 'published' } },
    pagination: false,
    overrideAccess: true,
  })

  const items: Order['items'] = body.items.map((i) => {
    const p = products.find((x) => x.id === i.product)
    if (!p) throw new Error('Товар не найден')
    return { product: p.id, quantity: i.quantity, unitPrice: p.priceRub }
  })

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)

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
}