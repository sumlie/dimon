import type { PayloadRequest } from 'payload'

import type { OrderItem, Product } from './types'

export const getProductId = (product: OrderItem['product']) =>
  product && typeof product === 'object' ? product.id : (product ?? null)

export async function getProductsById(req: PayloadRequest, items: OrderItem[]) {
  const map = new Map<string | number, Product>()

  const ids = [
    ...new Set(
      items.map((i) => getProductId(i.product)).filter((v): v is string | number => v != null),
    ),
  ]

  if (!ids.length) return map

  try {
    const res = await req.payload.find({
      collection: 'products',
      where: { id: { in: ids } },
      depth: 1,
      pagination: false,
      req,
      user: req.user,
      overrideAccess: false,
    })

    for (const p of res.docs as unknown as Product[]) map.set(p.id, p)
  } catch (e) {
    console.error('Не удалось загрузить товары для заказа', e)
  }

  return map
}