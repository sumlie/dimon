import type { Order, Product } from '@/payloadTypes'

export type { Order, Product }
export type OrderItem = NonNullable<Order['items']>[number]